$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$androidRoot = Join-Path $root "android"
$manifestPath = Join-Path $androidRoot "app\src\main\AndroidManifest.xml"
$colorsPath = Join-Path $androidRoot "app\src\main\res\values\colors.xml"
$stylesPath = Join-Path $androidRoot "app\src\main\res\values\styles.xml"
$iconSource = Join-Path $root "assets\icon.png"
$logoSource = Join-Path $root "assets\logo.png"

if (-not (Test-Path $iconSource)) {
  throw "Icon asset not found: $iconSource"
}

if (-not (Test-Path $logoSource)) {
  throw "Logo asset not found: $logoSource"
}

Add-Type -AssemblyName System.Drawing

function Save-ResizedPng($source, $target, $size) {
  $image = [System.Drawing.Image]::FromFile($source)
  try {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.Clear([System.Drawing.Color]::Transparent)

        $scale = [Math]::Min($size / $image.Width, $size / $image.Height)
        $width = [int]($image.Width * $scale)
        $height = [int]($image.Height * $scale)
        $x = [int](($size - $width) / 2)
        $y = [int](($size - $height) / 2)

        $graphics.DrawImage($image, $x, $y, $width, $height)
      } finally {
        $graphics.Dispose()
      }

      $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $image.Dispose()
  }
}

$iconSizes = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

$splashSizes = @{
  "drawable-mdpi" = 180
  "drawable-hdpi" = 270
  "drawable-xhdpi" = 360
  "drawable-xxhdpi" = 540
  "drawable-xxxhdpi" = 720
}

foreach ($entry in $iconSizes.GetEnumerator()) {
  $dir = Join-Path $androidRoot "app\src\main\res\$($entry.Key)"
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Save-ResizedPng $iconSource (Join-Path $dir "app_icon.png") $entry.Value
}

foreach ($entry in $splashSizes.GetEnumerator()) {
  $dir = Join-Path $androidRoot "app\src\main\res\$($entry.Key)"
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Save-ResizedPng $logoSource (Join-Path $dir "splashscreen_logo.png") $entry.Value
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath
$manifest = $manifest -replace 'android:icon="@mipmap/[^"]+"', 'android:icon="@mipmap/app_icon"'
$manifest = $manifest -replace 'android:roundIcon="@mipmap/[^"]+"', 'android:roundIcon="@mipmap/app_icon"'
Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

$colors = Get-Content -Raw -LiteralPath $colorsPath
$colors = $colors -replace '<color name="splashscreen_background">[^<]+</color>', '<color name="splashscreen_background">#0b0705</color>'
$colors = $colors -replace '<color name="colorPrimaryDark">[^<]+</color>', '<color name="colorPrimaryDark">#0b0705</color>'
Set-Content -LiteralPath $colorsPath -Value $colors -Encoding UTF8

$styles = Get-Content -Raw -LiteralPath $stylesPath
$styles = $styles -replace '<item name="android:statusBarColor">[^<]+</item>', '<item name="android:statusBarColor">#0b0705</item>'
if ($styles -notmatch 'android:navigationBarColor') {
  $styles = $styles -replace '(<item name="android:statusBarColor">#0b0705</item>)', "`$1`r`n    <item name=""android:navigationBarColor"">#0b0705</item>"
}
if ($styles -notmatch 'android:windowLightStatusBar') {
  $styles = $styles -replace '(<item name="android:navigationBarColor">#0b0705</item>)', "`$1`r`n    <item name=""android:windowLightStatusBar"">false</item>"
}
Set-Content -LiteralPath $stylesPath -Value $styles -Encoding UTF8

Write-Host "Android icon and splash assets prepared."
