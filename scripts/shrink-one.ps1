Add-Type -AssemblyName System.Drawing
$path = (Resolve-Path "src\assets\samples\sample-edit-marks.jpg").Path
$image = [System.Drawing.Image]::FromFile($path)
$width = 1100
$height = [Math]::Max(1, [int]($image.Height * ($width / $image.Width)))
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($image, 0, 0, $width, $height)
$image.Dispose()
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]48)
$bitmap.Save($path, $codec, $params)
$bitmap.Dispose()
$graphics.Dispose()
Write-Output ((Get-Item $path).Length)
