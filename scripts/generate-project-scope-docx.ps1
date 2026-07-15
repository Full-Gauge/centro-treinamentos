param(
  [string]$InputPath = (Join-Path $PSScriptRoot "..\docs\escopo-projeto.md"),
  [string]$OutputPath = (Join-Path $PSScriptRoot "..\.artifacts\escopo-projeto.docx")
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

function Escape-Xml([string]$Text) {
  return [System.Security.SecurityElement]::Escape($Text)
}

function New-RunXml {
  param(
    [Parameter(Mandatory = $true)][string]$Text,
    [int]$Size = 22,
    [string]$Color = "000000",
    [bool]$Bold = $false,
    [bool]$Italic = $false,
    [string]$Font = "Calibri"
  )

  $rPr = '<w:rPr>'
  $rPr += '<w:rFonts w:ascii="' + $Font + '" w:hAnsi="' + $Font + '"/>'
  $rPr += '<w:sz w:val="' + $Size + '"/>'
  $rPr += '<w:szCs w:val="' + $Size + '"/>'
  $rPr += '<w:color w:val="' + $Color + '"/>'
  if ($Bold) { $rPr += '<w:b/>' }
  if ($Italic) { $rPr += '<w:i/>' }
  $rPr += '</w:rPr>'

  return '<w:r>' + $rPr + '<w:t xml:space="preserve">' + (Escape-Xml $Text) + '</w:t></w:r>'
}

function New-ParagraphXml {
  param(
    [Parameter(Mandatory = $true)][string[]]$Runs,
    [int]$Before = 0,
    [int]$After = 120,
    [int]$Line = 260,
    [string]$Align = "left",
    [int]$IndentLeft = 0,
    [int]$IndentHanging = 0,
    [string]$Shading = $null
  )

  $pPr = '<w:pPr>'
  $pPr += '<w:spacing w:before="' + $Before + '" w:after="' + $After + '" w:line="' + $Line + '" w:lineRule="auto"/>'
  $pPr += '<w:jc w:val="' + $Align + '"/>'
  if ($IndentLeft -ne 0 -or $IndentHanging -ne 0) {
    $pPr += '<w:ind w:left="' + $IndentLeft + '" w:hanging="' + $IndentHanging + '"/>'
  }
  if ($Shading) {
    $pPr += '<w:shd w:val="clear" w:color="auto" w:fill="' + $Shading + '"/>'
  }
  $pPr += '</w:pPr>'

  return '<w:p>' + $pPr + ($Runs -join '') + '</w:p>'
}

function New-CodeParagraphXml {
  param([Parameter(Mandatory = $true)][string]$Text)
  return New-ParagraphXml `
    -Runs @((New-RunXml -Text $Text -Size 19 -Font "Consolas" -Color "1F1F1F")) `
    -Before 0 -After 40 -Line 240 -IndentLeft 720 -Shading "F6F8FA"
}

function Parse-MarkdownBlocks {
  param([string[]]$Lines)

  $blocks = New-Object System.Collections.Generic.List[object]
  $paragraph = New-Object System.Collections.Generic.List[string]
  $code = New-Object System.Collections.Generic.List[string]
  $inCode = $false

  function Flush-Paragraph {
    if ($paragraph.Count -gt 0) {
      $blocks.Add(@{
          Type = "paragraph"
          Text = ($paragraph -join " ").Trim()
        })
      $paragraph.Clear()
    }
  }

  function Flush-Code {
    if ($code.Count -gt 0) {
      $blocks.Add(@{
          Type = "code"
          Lines = @($code)
        })
      $code.Clear()
    }
  }

  foreach ($rawLine in $Lines) {
    $line = $rawLine.TrimEnd()

    if ($line -match '^```') {
      if ($inCode) {
        Flush-Code
        $inCode = $false
      } else {
        Flush-Paragraph
        $inCode = $true
      }
      continue
    }

    if ($inCode) {
      $code.Add($rawLine)
      continue
    }

    if ($line -match '^(#{1,6})\s+(.+)$') {
      Flush-Paragraph
      $blocks.Add(@{
          Type = "heading"
          Level = $Matches[1].Length
          Text = $Matches[2].Trim()
        })
      continue
    }

    if ($line -match '^\s*-\s+(.+)$') {
      Flush-Paragraph
      $blocks.Add(@{
          Type = "bullet"
          Text = $Matches[1].Trim()
        })
      continue
    }

    if ([string]::IsNullOrWhiteSpace($line)) {
      Flush-Paragraph
      continue
    }

    $paragraph.Add($line.Trim())
  }

  Flush-Paragraph
  Flush-Code
  return $blocks.ToArray()
}

function Build-DocumentXml {
  param([object[]]$Blocks)

  $body = New-Object System.Collections.Generic.List[string]
  $titleDone = $false

  foreach ($block in $Blocks) {
    switch ($block.Type) {
      "heading" {
        $level = [int]$block.Level
        if (-not $titleDone -and $level -eq 1) {
          $body.Add((New-ParagraphXml -Runs @(
                (New-RunXml -Text $block.Text -Size 42 -Color "000000" -Bold:$false)
              ) -Before 0 -After 80 -Line 240))
          $titleDone = $true
          continue
        }

        switch ($level) {
          1 {
            $body.Add((New-ParagraphXml -Runs @((New-RunXml -Text $block.Text -Size 28 -Color "2E74B5")) -Before 240 -After 80 -Line 240))
          }
          2 {
            $body.Add((New-ParagraphXml -Runs @((New-RunXml -Text $block.Text -Size 22 -Color "1F4D78")) -Before 180 -After 60 -Line 240))
          }
          default {
            $body.Add((New-ParagraphXml -Runs @((New-RunXml -Text $block.Text -Size 18 -Color "1F4D78")) -Before 120 -After 40 -Line 240))
          }
        }
      }
      "paragraph" {
        $size = 22
        $color = "000000"
        $italic = $false
        if (-not $titleDone) {
          $size = 18
          $color = "444444"
          $italic = $true
        }
        $body.Add((New-ParagraphXml -Runs @((New-RunXml -Text $block.Text -Size $size -Color $color -Italic:$italic)) -Before 0 -After 120 -Line 260))
      }
      "bullet" {
        $body.Add((New-ParagraphXml -Runs @(
              (New-RunXml -Text ([char]0x2022) -Size 22 -Color "2E74B5" -Bold:$true),
              (New-RunXml -Text $block.Text -Size 22 -Color "000000")
            ) -Before 0 -After 40 -Line 250 -IndentLeft 720 -IndentHanging 360))
      }
      "code" {
        $body.Add((New-ParagraphXml -Runs @((New-RunXml -Text "Codigo" -Size 10 -Font "Consolas" -Color "666666" -Italic:$true)) -Before 80 -After 20 -Line 220))
        foreach ($line in $block.Lines) {
          $body.Add((New-CodeParagraphXml -Text $line))
        }
        $body.Add((New-ParagraphXml -Runs @((New-RunXml -Text " " -Size 1)) -Before 0 -After 80 -Line 120))
      }
    }
  }

  $body.Add('<w:p><w:pPr><w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:pPr></w:p>')

  return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    $($body -join "`n    ")
  </w:body>
</w:document>
"@
}

function Write-DocxPackage {
  param(
    [Parameter(Mandatory = $true)][string]$DocumentXml,
    [Parameter(Mandatory = $true)][string]$TargetPath
  )

  $parent = Split-Path -Parent $TargetPath
  if ($parent -and -not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  if (Test-Path $TargetPath) {
    Remove-Item -LiteralPath $TargetPath -Force
  }

  $contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"@

  $rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

  $zip = [System.IO.Compression.ZipFile]::Open($TargetPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    $entries = @{
      "[Content_Types].xml" = $contentTypes
      "_rels/.rels"         = $rels
      "word/document.xml"   = $DocumentXml
    }

    foreach ($name in $entries.Keys) {
      $entry = $zip.CreateEntry($name)
      $stream = $entry.Open()
      try {
        $writer = New-Object System.IO.StreamWriter($stream, (New-Object System.Text.UTF8Encoding($false)))
        try {
          $writer.Write($entries[$name])
        } finally {
          $writer.Dispose()
        }
      } finally {
        $stream.Dispose()
      }
    }
  } finally {
    $zip.Dispose()
  }
}

function Test-DocxPackage {
  param([Parameter(Mandatory = $true)][string]$DocxPath)

  $zip = [System.IO.Compression.ZipFile]::OpenRead($DocxPath)
  try {
    $documentEntry = $zip.GetEntry("word/document.xml")
    if (-not $documentEntry) {
      throw "word/document.xml not found"
    }

    $reader = New-Object System.IO.StreamReader($documentEntry.Open())
    try {
      $xmlText = $reader.ReadToEnd()
      [xml]$null = $xmlText
    } finally {
      $reader.Dispose()
    }
  } finally {
    $zip.Dispose()
  }
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$source = Get-Content -LiteralPath $resolvedInput -Raw -Encoding UTF8
$blocks = Parse-MarkdownBlocks -Lines ($source -split "`r?`n")
$documentXml = Build-DocumentXml -Blocks $blocks

Write-DocxPackage -DocumentXml $documentXml -TargetPath $OutputPath
Test-DocxPackage -DocxPath $OutputPath

Write-Host $OutputPath
