from pathlib import Path
import re

ROOT=Path('tk2')

def read(name): return (ROOT/name).read_text(encoding='utf-8')
def write(name,s): (ROOT/name).write_text(s,encoding='utf-8')

def once(s,old,new,label):
    c=s.count(old)
    assert c==1, f'{label}: expected 1 occurrence, found {c}'
    return s.replace(old,new,1)

# A1: shared stylesheet wins over the old inline copy, and shared JS owns rendering/observer logic.
s=read('A1.html')
s=once(s,'  </style>\n</head>','  </style>\n  <link rel="stylesheet" href="theoryCards.css">\n</head>','A1 css link')
s=once(s,'  <script src="utilityScenes.js"></script>\n  <script>','  <script src="utilityScenes.js"></script>\n  <script src="theoryCards.js"></script>\n  <script>','A1 js link')
pat=re.compile(r"      var grid=document\.getElementById\('theoryGrid'\),scenes=\[\],phaseActive=true,lastGroup='';.*?      window\.tk2SetTheoryActive=function\(value\)\{phaseActive=Boolean\(value\);scenes\.forEach\(function\(x\)\{x\.scene\.setActive\(phaseActive&&x\.visible\);\}\);\};",re.S)
new="""      var theoryController=window.tk2TheoryCards.mount({
        grid:'theoryGrid',
        groups:groupMeta,
        items:theoryItems,
        accent:'#38bdf8',
        rgb:'56,189,248',
        accentText:'#bae6fd',
        sceneFactory:function(target,item){
          return item.family==='doc'
            ? createDocTextScene(target,{mode:item.mode,autoplay:false})
            : createUtilityScene(target,{mode:item.mode,autoplay:false});
        }
      });
      window.tk2SetTheoryActive=function(value){theoryController.setActive(value);};"""
s,n=pat.subn(new,s,count=1)
assert n==1, f'A1 renderer replacement count={n}'
write('A1.html',s)

# A4/A5: same component, same classes, same single observer. Quest/PDF logic stays untouched.
for html,app,grid_id,accent_text in [
    ('A4.html','a4-app.js','q8TheoryGrid','#67e8f9'),
    ('A5.html','a5-app.js','q9TheoryGrid','#93c5fd'),
]:
    h=read(html)
    h=once(h,'  </style>\n</head>','  </style>\n  <link rel="stylesheet" href="theoryCards.css">\n</head>',f'{html} css link')
    h=h.replace(f'<div class="lesson-grid" id="{grid_id}"></div>',f'<div class="theory-grid" id="{grid_id}"></div>',1)
    assert f'<div class="theory-grid" id="{grid_id}"></div>' in h
    h=once(h,'<script src="a4Scenes.js"></script>\n<script src="'+app+'"></script>','<script src="a4Scenes.js"></script>\n<script src="theoryCards.js"></script>\n<script src="'+app+'"></script>',f'{html} js link')
    write(html,h)

    a=read(app)
    a=once(a,'var fresh=false,theoryRendered=false,theoryScenes=[];','var fresh=false,theoryRendered=false,theoryController=null;',f'{app} controller var')
    q='8' if app=='a4-app.js' else '9'
    pat_render=re.compile(r"  function renderTheory\(\)\{.*?\n  \}\n\n  function showFiftyFifty",re.S)
    render=f"""  function renderTheory(){{
    if(theoryRendered)return;
    theoryRendered=true;
    theoryController=window.tk2TheoryCards.mount({{
      grid:'q{q}TheoryGrid',
      groups:GROUP_META,
      items:META.lesson,
      accent:META.theme.accent,
      rgb:META.theme.rgb,
      accentText:'{accent_text}',
      sceneFactory:function(target,item){{
        return createA4Scene(target,{{mode:item.mode,autoplay:false}});
      }}
    }});
  }}

  function showFiftyFifty"""
    a,n=pat_render.subn(render,a,count=1)
    assert n==1, f'{app}: renderTheory replacement count={n}'
    display=f"byId('q{q}TheoryCard').style.display=fresh?'none':'';"
    repl=display+"\n    if(theoryController)theoryController.setActive(!fresh);"
    a=once(a,display,repl,f'{app} active sync')
    assert 'lesson-anim-card' not in re.search(r'function renderTheory\(\).*?function showFiftyFifty',a,re.S).group(0)
    write(app,a)

# Structural contract checks.
a1=read('A1.html'); a4=read('A4.html'); a5=read('A5.html')
for name,s in [('A1',a1),('A4',a4),('A5',a5)]:
    assert 'theoryCards.css' in s, name
    assert 'theoryCards.js' in s, name
for app in ['a4-app.js','a5-app.js']:
    s=read(app)
    assert 'window.tk2TheoryCards.mount' in s
    assert 'IntersectionObserver' not in re.search(r'function renderTheory\(\).*?function showFiftyFifty',s,re.S).group(0)
scenes=read('a4Scenes.js')
assert 'viewBox="0 0 680 320"' not in scenes
assert scenes.count('viewBox="0 0 560 320"')>=2
print('A1/A4/A5 now share theoryCards component, classes and observer logic')
