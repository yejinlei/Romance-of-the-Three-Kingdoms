# 批量下载维基文库《三国演义》其他版本文本
# 1) 嘉靖本三國志通俗演義（中文维基文库转录本，240则）
# 2) San Kuo（Brewitt-Taylor 1925 英译本，120回）
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$outDir = "D:\src\Romance-of-the-Three-Kingdoms\docs\texts"

# ---------- 通用：批量抓取 wikitext（POST，每批 50 题） ----------
function Get-WikiRaw([string]$api, [string[]]$titles) {
    $map = @{}
    for ($i = 0; $i -lt $titles.Count; $i += 50) {
        $last = [Math]::Min($i + 49, $titles.Count - 1)
        $chunk = @($titles[$i..$last])
        $body = @{
            action       = "query"
            prop         = "revisions"
            rvprop       = "content"
            rvslots      = "main"
            format       = "json"
            formatversion= "2"
            redirects    = "1"
            titles       = ($chunk -join "|")
        }
        $r = Invoke-RestMethod -Uri $api -Method Post -Body $body -TimeoutSec 120
        foreach ($p in $r.query.pages) {
            if ($p.revisions) { $map[$p.title] = $p.revisions[0].slots.main.content }
        }
        Write-Host ("  raw batch {0}-{1} ok, got {2}" -f $i, $last, $map.Count)
        Start-Sleep -Milliseconds 600
    }
    return $map
}

# ---------- 1. 嘉靖本（维基文库转录本） ----------
Write-Host "=== 嘉靖本（维基文库转录本） ==="
$apiZh = "https://zh.wikisource.org/w/api.php"
$titles = New-Object System.Collections.Generic.List[string]
$titles.Add("嘉靖本三國志通俗演義/序")
$titles.Add("嘉靖本三國志通俗演義/引")
$titles.Add("嘉靖本三國志通俗演義/三國志宗僚")
for ($n = 1; $n -le 240; $n++) { $titles.Add(("嘉靖本三國志通俗演義/第{0:000}回" -f $n)) }
$raw = Get-WikiRaw $apiZh $titles.ToArray()

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("《三國志通俗演義》嘉靖本（維基文庫轉錄本）")
[void]$sb.AppendLine("來源：中文維基文庫「嘉靖本三國志通俗演義」（https://zh.wikisource.org/wiki/嘉靖本三國志通俗演義）")
[void]$sb.AppendLine("說明：明嘉靖壬午（1522）刊《三國志通俗演義》24卷240則之維基文庫獨立轉錄，繁體原貌，可與庫內嘉靖壬午本.txt對勘。轉錄文字許可 CC BY-SA 4.0，原文 PD-old。")
[void]$sb.AppendLine("")
$missing = @()
foreach ($t in $titles) {
    if (-not $raw.ContainsKey($t)) { $missing += $t; continue }
    $c = $raw[$t]
    # {{Novel|书名|第X回　标题|prev|next|}} → 标题行
    $m = [regex]::Match($c, '\{\{Novel\|[^|]*\|([^|\r\n]*)\|')
    if ($m.Success) {
        [void]$sb.AppendLine("### " + $m.Groups[1].Value.Trim())
        $c = [regex]::Replace($c, '(?s)\{\{Novel\|[^\r\n]*?\}\}\s*', '')
    }
    # {{*|音吝}} → （音吝）
    $c = [regex]::Replace($c, '\{\{\*\|([^{}]*)\}\}', '（$1）')
    # 去掉其余模板与 wiki 链接
    for ($k = 0; $k -lt 5; $k++) {
        $nc = [regex]::Replace($c, '\{\{[^{}]*\}\}', '')
        if ($nc -eq $c) { break }
        $c = $nc
    }
    $c = [regex]::Replace($c, '\[\[[^\|\]]*\|([^\]]*)\]\]', '$1')
    $c = [regex]::Replace($c, '\[\[([^\]]*)\]\]', '$1')
    $c = [regex]::Replace($c, '(?s)<!--.*?-->', '')
    [void]$sb.AppendLine($c.Trim())
    [void]$sb.AppendLine("")
}
$jiajingPath = Join-Path $outDir "嘉靖壬午本_维基文库转录.txt"
[System.IO.File]::WriteAllText($jiajingPath, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("嘉靖本转录本完成：{0}，缺页 {1}" -f $jiajingPath, $missing.Count)
if ($missing.Count -gt 0) { $missing | ForEach-Object { Write-Host ("  missing: " + $_) } }

# ---------- 2. San Kuo（Brewitt-Taylor 1925 英译本） ----------
Write-Host "=== San Kuo 英译本 ==="
$apiEn = "https://en.wikisource.org/w/api.php"
$sb2 = New-Object System.Text.StringBuilder
[void]$sb2.AppendLine("San Kuo, or Romance of the Three Kingdoms (English translation)")
[void]$sb2.AppendLine("Translator: Charles Henry Brewitt-Taylor, 1925 (public domain)")
[void]$sb2.AppendLine("Source: English Wikisource ""San Kuo"" (https://en.wikisource.org/wiki/San_Kuo)")
[void]$sb2.AppendLine("Note: Chapter titles and text preserved as translated. Proofread from Wikisource Page namespace.")
[void]$sb2.AppendLine("")
$fail = @()
for ($n = 1; $n -le 120; $n++) {
    $vol = if ($n -le 60) { 1 } else { 2 }
    $title = "San Kuo/Volume $vol/Chapter $n"
    $enc = [System.Uri]::EscapeDataString($title)
    try {
        $r = Invoke-RestMethod -Uri "$apiEn?action=parse&page=$enc&prop=text&format=json&formatversion=2&redirects=1" -TimeoutSec 90
        $h = $r.parse.text
    } catch {
        $fail += $title; Write-Host ("  FAIL $title : $($_.Exception.Message)"); continue
    }
    $t = [regex]::Replace($h, '(?s)<!--.*?-->', '')
    $t = [regex]::Replace($t, '(?s)<style.*?</style>', '')
    $t = [regex]::Replace($t, '(?s)<sup.*?</sup>', '')
    $t = [regex]::Replace($t, '(?i)<link[^>]*>', '')
    $m = [regex]::Match($t, 'CHAPTER\s+[IVXLC]+\.')
    if ($m.Success) { $t = $t.Substring($m.Index) }
    $t = $t -replace '(?i)</p>', "`n`n"
    $t = $t -replace '(?i)<br\s*/?>', "`n"
    $t = $t -replace '(?i)</div>', "`n"
    $t = [regex]::Replace($t, '<[^>]+>', '')
    $t = [System.Net.WebUtility]::HtmlDecode($t)
    $t = $t -replace [string][char]0x200B, ''
    $t = [regex]::Replace($t, "`n{3,}", "`n`n")
    $t = $t.Trim()
    [void]$sb2.AppendLine("==============================")
    [void]$sb2.AppendLine(("[Volume {0} · Chapter {1}]" -f $vol, $n))
    [void]$sb2.AppendLine("==============================")
    [void]$sb2.AppendLine("")
    [void]$sb2.AppendLine($t)
    [void]$sb2.AppendLine("")
    if ($n % 20 -eq 0) { Write-Host ("  ch {0} done" -f $n) }
    Start-Sleep -Milliseconds 300
}
$sankuoPath = Join-Path $outDir "SanKuo_BrewittTaylor英译本.txt"
[System.IO.File]::WriteAllText($sankuoPath, $sb2.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("San Kuo 完成：{0}，失败 {1}" -f $sankuoPath, $fail.Count)

# ---------- 3. 汇总 ----------
foreach ($f in @($jiajingPath, $sankuoPath)) {
    $len = (Get-Item $f).Length
    $txt = [System.IO.File]::ReadAllText($f)
    Write-Host ("{0} | bytes={1} | chars={2}" -f (Split-Path $f -Leaf), $len, $txt.Length)
}
Write-Host "ALL DONE"
