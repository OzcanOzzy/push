# api/uploads klasorunu sunucuya kopyalar.
# Kullanim: Cursor'da Terminal ac, proje kokunde "npm run upload-files" yaz.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$UploadsLocal = Join-Path $ProjectRoot "api\uploads"
$UploadsRemote = "/root/ozcanaktasweb/ozcanaktasweb/api/uploads"

# Sunucu adresi: .upload-server dosyasinda "root@IP" yazabilirsin, yoksa asagidaki kullanilir
$ServerFile = Join-Path $ProjectRoot ".upload-server"
if (Test-Path $ServerFile) {
    $Server = (Get-Content $ServerFile -Raw).Trim()
} else {
    $Server = $env:UPLOAD_SERVER
    if (-not $Server) { $Server = "root@209.38.236.87" }
}

if (-not (Test-Path $UploadsLocal)) {
    Write-Host "HATA: api\uploads klasoru bulunamadi: $UploadsLocal" -ForegroundColor Red
    exit 1
}

Write-Host "Uploads sunucuya gonderiliyor..." -ForegroundColor Cyan
Write-Host "  Yerel:  $UploadsLocal" -ForegroundColor Gray
Write-Host "  Sunucu: $Server : $UploadsRemote" -ForegroundColor Gray
Write-Host ""

# Sunucuda klasoru olustur, sonra kopyala
& ssh $Server "mkdir -p $UploadsRemote"
& scp -r "${UploadsLocal}\*" "${Server}:${UploadsRemote}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Tamam. api/uploads sunucuya kopyalandi." -ForegroundColor Green
} else {
    Write-Host "Kopyalama basarisiz. SSH baglantinizi ve sunucu adresini kontrol edin." -ForegroundColor Red
    exit 1
}
