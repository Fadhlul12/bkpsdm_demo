with open('staf.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The bad pattern - with literal backslash-n in the file
bad = ".staff-search input{\\n    border:none; background:transparent; outline:none; width:100%;\\n    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:var(--charcoal);\\n  }\\n  .search-clear-btn{\\n    display:none; align-items:center; justify-content:center;\\n    width:24px; height:24px; border-radius:50%; border:none; flex-shrink:0;\\n    background:rgba(27,54,93,0.1); color:var(--teal); cursor:pointer;\\n    font-size:12px; transition:all .15s ease; padding:0;\\n  }\\n  .search-clear-btn:hover{background:var(--ink); color:var(--cream);}\\n  .search-clear-btn.visible{display:inline-flex;}\\n  .status-filters{display:flex; gap:8px; flex-wrap:wrap;}"

good = """.staff-search input{
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
  .status-filters{display:flex; gap:8px; flex-wrap:wrap;}"""

if bad in content:
    content = content.replace(bad, good)
    with open('staf.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed OK')
else:
    idx = content.find('.staff-search input{')
    print('Pattern not found. Sample:', repr(content[idx:idx+60]))
