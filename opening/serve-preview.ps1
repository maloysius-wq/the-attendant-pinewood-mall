# The Attendant: The Call - offline Windows static preview server.
# Serves only extracted package files on 127.0.0.1, with local OGG range support.
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath([IO.Path]::Combine($PSScriptRoot,'..'))
$crlf=[char]13+[char]10
$port=8765
$listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$port)
$mimes=@{
 '.html'='text/html; charset=utf-8';'.htm'='text/html; charset=utf-8'
 '.js'='text/javascript; charset=utf-8';'.mjs'='text/javascript; charset=utf-8'
 '.css'='text/css; charset=utf-8';'.json'='application/json'
 '.txt'='text/plain; charset=utf-8';'.ogg'='audio/ogg';'.mp3'='audio/mpeg'
 '.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.webp'='image/webp'
 '.svg'='image/svg+xml';'.glb'='model/gltf-binary';'.gltf'='model/gltf+json'
 '.bin'='application/octet-stream';'.wasm'='application/wasm'
 '.woff2'='font/woff2';'.woff'='font/woff';'.ttf'='font/ttf'
}
function Reply($stream,$code,$reason,$message) {
 $bytes=[Text.Encoding]::UTF8.GetBytes($message)
 $header="HTTP/1.1 $code $reason"+$crlf+"Content-Type: text/plain; charset=utf-8"+$crlf+"Content-Length: "+$bytes.Length+$crlf+"Connection: close"+$crlf+$crlf
 $raw=[Text.Encoding]::ASCII.GetBytes($header);$stream.Write($raw,0,$raw.Length)
 if($bytes.Length){$stream.Write($bytes,0,$bytes.Length)}
}
try {
 $listener.Start(100)
 Write-Host 'Pinewood opening preview at http://127.0.0.1:8765/?openingPreview=1'
 Write-Host 'Close this console to stop the preview.'
 while($true) {
  $client=$listener.AcceptTcpClient()
  try {
   $client.ReceiveTimeout=13000
   $stream=$client.GetStream()
   $reader=[IO.StreamReader]::new($stream,[Text.Encoding]::ASCII,$false,1024,$true)
   $first=$reader.ReadLine()
   if(!$first){continue}
   $parts=$first.Split(' ')
   $method=$parts[0]
   if($parts.Length -lt 2 -or ($method -ne 'GET' -and $method -ne 'HEAD')) {
    Reply $stream 405 'Method Not Allowed' 'Method Not Allowed'
    continue
   }
   $range=$null
   while($true) {
    $headerLine=$reader.ReadLine()
    if(!$headerLine){break}
    if($headerLine -match '^\s*Range:\s*(.*)$'){$range=$Matches[1]}
   }
   $urlPath=[Uri]::UnescapeDataString($parts[1].Split('?')[0].Split('#')[0])
   if(!$urlPath -or $urlPath -eq '/'){$urlPath='/index.html'}
   $decoded=$urlPath.TrimStart('/').Replace('/','\')
   $filePath=[IO.Path]::GetFullPath([IO.Path]::Combine($root,$decoded))
   if(!$filePath.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) {
    Reply $stream 403 'Forbidden' 'Forbidden';continue
   }
   if(!(Test-Path -LiteralPath $filePath -PathType Leaf)) {
    Reply $stream 404 'Not Found' 'Not Found';continue
   }
   $ext=[IO.Path]::GetExtension($filePath).ToLowerInvariant()
   $mime=if($mimes.ContainsKey($ext)){$mimes[$ext]}else{'application/octet-stream'}
   $file=[IO.File]::OpenRead($filePath)
   try {
    $total=$file.Length;$start=[long]0;$end=[long]($total-1);$partial=$false
    if($range -and $range -match '^bytes=(\d+)-(\d*)') {
     $start=[long]$Matches[1]
     if($Matches[2]){$end=[Math]::Min($end,[long]$Matches[2])}
     if($start -ge $total){Reply $stream 416 'Range Not Satisfiable' 'Range Not Satisfiable';continue}
     $partial=$true
    }
    $length=[long][Math]::Max(0,$end-$start+1)
    $status=if($partial){'206 Partial Content'}else{'200 OK'}
    $header='HTTP/1.1 '+$status+$crlf+'Content-Type: '+$mime+$crlf+'Accept-Ranges: bytes'+$crlf+'Content-Length: '+$length+$crlf+'Cache-Control: no-store'+$crlf+'Connection: close'+$crlf
    if($partial){$header+='Content-Range: bytes '+$start+'-'+$end+'/'+$total+$crlf}
    $header+=$crlf
    $headers=[Text.Encoding]::ASCII.GetBytes($header);$stream.Write($headers,0,$headers.Length)
    if($method -eq 'HEAD'){continue}
    $file.Seek($start,[IO.SeekOrigin]::Begin)|Out-Null
    $buffer=New-Object byte[] 65536
    while($length -gt 0){
      $read=$file.Read($buffer,0,[int][Math]::Min($buffer.Length,$length))
      if($read -le 0){break}
      $stream.Write($buffer,0,$read);$length-=$read
    }
   }finally{$file.Dispose()}
  }catch{Write-Host ('Local preview request: '+$_.Exception.Message)}
  finally{$client.Close()}
 }
}finally{$listener.Stop()}
