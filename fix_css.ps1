$file = 'd:\Download\sipadu-bkpsdm-dumai\staf.html'
$content = Get-Content $file -Raw

$bad = "  .staff-search input{\n    border:none; background:transparent; outline:none; width:100%;\n    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:var(--charcoal);\n  }\n  .search-clear-btn{\n    display:none; align-items:center; justify-content:center;\n    width:24px; height:24px; border-radius:50%; border:none; flex-shrink:0;\n    background:rgba(27,54,93,0.1); color:var(--teal); cursor:pointer;\n    font-size:12px; transition:all .15s ease; padding:0;\n  }\n  .search-clear-btn:hover{background:var(--ink); color:var(--cream);}\n  .search-clear-btn.visible{display:inline-flex;}\n  .status-filters{display:flex; gap:8px; flex-wrap:wrap;}"

$good = @"
  .staff-search input{
    border:none; background:transparent; outline:none; width:100%;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:var(--charcoal);
  }
  .search-clear-btn{
    display:none; align-items:center; justify-content:center;
    width:24px; height:24px; border-radius:50%; border:none; flex-shrink:0;
    background:rgba(27,54,93,0.1); color:var(--teal); cursor:pointer;
    font-size:12px; transition:all .15s ease; padding:0;
  }
  .search-clear-btn:hover{background:var(--ink); color:var(--cream);}
  .search-clear-btn.visible{display:inline-flex;}
  .status-filters{display:flex; gap:8px; flex-wrap:wrap;}
"@

# The bad content uses literal \n (backslash n), replace with actual newlines
$badLiteral = "  .staff-search input{\`n    border:none; background:transparent; outline:none; width:100%;\`n    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:var(--charcoal);\`n  }\`n  .search-clear-btn{\`n    display:none; align-items:center; justify-content:center;\`n    width:24px; height:24px; border-radius:50%; border:none; flex-shrink:0;\`n    background:rgba(27,54,93,0.1); color:var(--teal); cursor:pointer;\`n    font-size:12px; transition:all .15s ease; padding:0;\`n  }\`n  .search-clear-btn:hover{background:var(--ink); color:var(--cream);}\`n  .search-clear-btn.visible{display:inline-flex;}\`n  .status-filters{display:flex; gap:8px; flex-wrap:wrap;}"

if ($content.Contains($badLiteral)) {
    $fixed = $content.Replace($badLiteral, $good)
    Set-Content $file $fixed -NoNewline
    Write-Host "Fixed successfully"
} else {
    Write-Host "Pattern not found, trying regex..."
    # Try to match the single line with literal \n in it
    $lines = Get-Content $file
    $lineNum = ($lines | Select-String -SimpleMatch '.staff-search input{\\n').LineNumber
    Write-Host "Found on line: $lineNum"
    Write-Host "Content: $($lines[$lineNum-1])"
}
