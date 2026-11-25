# 下载 San Kuo（Brewitt-Taylor 1925 英译本）120回，POST 方式调用 parse 接口
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$outPath = "D:\src\Romance-of-the-Three-Kingdoms\docs\texts\SanKuo_BrewittTaylor英译本.txt"
$api = "https://en.wikisource.org/w/api.php"

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("San Kuo, or Romance of the Three Kingdoms (English translation)")
[void]$sb.AppendLine("Translator: Charles Henry Brewitt-Taylor, 1925 (public domain)")
[void]$sb.AppendLine("Source: English Wikisource ""San Kuo"" (https://en.wikisource.org/wiki/San_Kuo)")
[void]$sb.AppendLine("Note: Proofread text transcluded from Wikisource Page namespace.")
[void]$sb.AppendLine("")
$fail = @()
for ($n = 1; $n -le 120; $n++) {
    $vol = if ($n -le 60) { 1 } else { 2 }
    $title = "San Kuo/Volume $vol/Chapter $n"
    try {
        $r = Invoke-RestMethod -Uri $api -Method Post -Body @{
            action = "parse"; page = $title; prop = "text"
            format = "json"; formatversion = "2"; redirects = "1"
        } -TimeoutSec 90
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
    [void]$sb.AppendLine("==============================")
    [void]$sb.AppendLine(("[Volume {0} · Chapter {1}]" -f $vol, $n))
    [void]$sb.AppendLine("==============================")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine($t)
    [void]$sb.AppendLine("")
    if ($n % 20 -eq 0) { Write-Host ("  ch {0} done" -f $n) }
    Start-Sleep -Milliseconds 300
}
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
$len = (Get-Item $outPath).Length
$txt = [System.IO.File]::ReadAllText($outPath)
Write-Host ("San Kuo done: bytes={0} chars={1} fail={2}" -f $len, $txt.Length, $fail.Count)
Write-Host "ALL DONE"
