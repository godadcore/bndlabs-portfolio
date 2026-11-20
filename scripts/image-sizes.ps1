Add-Type -AssemblyName System.Drawing
Get-ChildItem "src\assets\samples\sample-*.jpg" | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  Write-Output ("{0} {1}x{2} {3}" -f $_.Name, $img.Width, $img.Height, $_.Length)
  $img.Dispose()
}
