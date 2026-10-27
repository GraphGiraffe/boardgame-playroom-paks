"""Build a standalone illustrated rulebook from the published pack's own art.
Run from any directory: python3 build.py --out /path/to/output
Rendering: node render.cjs /path/to/rulebook.html /path/to/rulebook.pdf
"""
import argparse,base64,hashlib,html,json,math,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parent
PACK=ROOT.parents[2]/'packs/mage-brawl'
p=argparse.ArgumentParser();p.add_argument('--out',type=pathlib.Path,required=True);args=p.parse_args();OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
A=json.loads(subprocess.check_output(['node',str(ROOT/'export-art.cjs')]))
E=['air','earth','water','fire'];N=dict(zip(E,['Воздух','Земля','Вода','Огонь']));C=A['colors']
def svg(body,view='0 0 100 100',cls=''):
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" class="{cls}">{body}</svg>'
def inner(s):return s[s.index('>')+1:s.rindex('</svg>')]
def icon(e):return f'<span class="element" style="color:{C[e]}">{A["elements"][e]}</span>'
def glyph(a):
 if a=='movement':return A['footprints']
 if a=='attack':return svg('<path d="M28 60 72 16l16-8-8 16L36 68Z" fill="currentColor"/><path d="M16 56l24 24M28 68l-16 16" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>')
 return svg('<path d="m16 29 20 16L50 20l14 25 20-16-8 49H24Z" fill="currentColor"/><path d="M25 86h50" stroke="currentColor" stroke-width="7"/>')
def actioncard(a):return f'<div class="type-card {a}">{glyph(a)}</div>'
uid=0
def card(e):
 global uid
 uid+=1;tag=f'c{uid}'
 return svg(f'<defs><clipPath id="{tag}a"><path d="M0 0H100L0 100Z"/></clipPath><clipPath id="{tag}b"><path d="M100 0V100H0Z"/></clipPath></defs><rect x="1" y="1" width="98" height="98" rx="10" fill="#fff9e9" stroke="{C[e]}" stroke-width="2"/><g clip-path="url(#{tag}a)"><g transform="translate(1 0) scale(.64)">{A["illustration"][e+"-movement"]}</g></g><g clip-path="url(#{tag}b)"><g transform="translate(35 35) scale(.64)">{A["illustration"][e+"-attack"]}</g></g><path d="M7 93 93 7" stroke="{C[e]}" stroke-width="1.4"/>',cls='spell-card')
def art(e,a):return svg(A['illustration'][e+'-'+a],cls='spell-art')
def diagram(e,a):return svg(A['diagrams'][e+'-'+a],cls='diagram')
def token(x,y,name='А',color='#3d8271',r=16):
 scale=r/41
 art=inner(A['pawnArt'])
 label=f'<text x="{x}" y="{y+5}" text-anchor="middle" fill="#fffbed" font-size="13" font-weight="700">{name}</text>' if name else ''
 return f'<g transform="translate({x-50*scale} {y-45*scale}) scale({scale})" style="--round-token-fill:{color};--round-token-side:color-mix(in srgb,{color} 65%,black);--round-token-rim:#fffbed">{art}</g>'+label

def line(x,y,X,Y,color='#29443b',dash=False):
 angle=math.degrees(math.atan2(Y-y,X-x))+90
 pattern='stroke-dasharray="6 4"' if dash else ''
 return f'<path d="M{x} {y}L{X} {Y}" stroke="#fffbed" stroke-width="8" fill="none"/><path d="M{x} {y}L{X} {Y}" stroke="{color}" stroke-width="3.5" fill="none" {pattern}/><path d="M-7 6 0-5 7 6" transform="translate({X} {Y}) rotate({angle})" stroke="#fffbed" stroke-width="7" fill="none"/><path d="M-7 6 0-5 7 6" transform="translate({X} {Y}) rotate({angle})" stroke="{color}" stroke-width="3" fill="none"/>'

def board(n=4,tiles=None,tokens=None,arrows=None,marks='',size=280):
 tiles=tiles or {};s='';step=size/n
 for row in range(n):
  for col in range(n):
   t=tiles.get((row,col),'ground');body=inner(A['terrain'][t]) if t in A['terrain'] else '<rect width="100" height="100" fill="#4b5448"/>'
   s+=f'<g transform="translate({col*step+2} {row*step+2}) scale({(step-4)/100})">{body}</g>'
 for row,col,name,color in tokens or []:s+=token((col+.5)*step,(row+.5)*step,name,color,step*.25)
 for row,col,R,K in arrows or []:
  x,y=(col+.5)*step,(row+.5)*step;X,Y=(K+.5)*step,(R+.5)*step;length=math.hypot(X-x,Y-y);ux,uy=(X-x)/length,(Y-y)/length
  start=step*.28;end=step*.28 if any(r==R and c==K for r,c,_,_ in tokens or []) else 0
  s+=line(x+ux*start,y+uy*start,X-ux*end,Y-uy*end)
 return svg(s+marks,f'0 0 {size} {size}',cls='board')
def badge(x,y,n):return f'<circle cx="{x}" cy="{y}" r="13" fill="#29483d" stroke="#fffbed" stroke-width="2"/><text x="{x}" y="{y+5}" fill="#fffbed" font-size="14" font-weight="700" text-anchor="middle">{n}</text>'
def note(t):return f'<aside>{t}</aside>'
def cols(a,b):return '<div class="cols"><div>'+a+'</div><div>'+b+'</div></div>'
def panel(title,body):return '<section class="panel"><h3>'+title+'</h3>'+body+'</section>'
def steps(items):return '<ol class="steps">'+''.join('<li>'+t+'</li>' for t in items)+'</ol>'
def p(t):return '<p>'+t+'</p>'
def small(t):return '<p class="small">'+t+'</p>'
P=[]
def page(kicker,title,body,cls=''):
 P.append(f'<section class="page {cls}"><div class="body"><div class="eyebrow">{kicker}</div><h1>{title}</h1>{body}</div><footer><span>СТИХИЙНАЯ ПОТАСОВКА · ПРАВИЛА ИГРЫ</span><b>{len(P)+1:02}</b></footer></section>')
cover='data:image/webp;base64,'+base64.b64encode((PACK/'assets/covers/arena-v8.webp').read_bytes()).decode()
page('Турнир четырёх стихий','Стихийная<br>потасовка',f'<img class="cover-art" src="{cover}" alt="Четыре стихии сталкиваются на арене">'+
 '<div class="invitation"><b>Колдуны и колдуньи, на арену!</b><p>Ежегодный турнир открывает ворота. Ветер собьёт соперников с ног, камень остановит удар, вода проложит путь, а огонь не оставит времени на раздумья.</p><p>Арена будет рушиться. Соперники будут возвращаться. Предугадайте их планы и останьтесь последним магом с хотя бы одной жизнью, чтобы завоевать кубок Стихийной потасовки.</p></div>'+ '<div class="cover-stats"><span>2-8 игроков</span><span>15-40 минут</span><span>Тайные планы</span></div>'+note('<b>Сначала спланируйте. Затем раскройтесь вместе.</b><br>В этой игре нет очереди ходов: маги выбирают действия одновременно.'),'cover')
# Table components: 6x6 arena with in-game terrains, physical player area and supplies.
tiles={(0,0):'base',(5,5):'base',(1,4):'base',(4,1):'base',(0,3):'wall',(2,1):'spikes',(4,4):'falling_floor',(1,1):'forest',(2,4):'puddle',(4,2):'desert',(3,0):'air_island'}
s=inner(board(6,tiles,[(0,0,'','#3d8271'),(5,5,'','#c86e57')],size=300))
s='<g transform="translate(12 10)">'+s+'</g>'
# reserves and player hand
component_size=46  # Same visible side as the arena tiles: 300/6 - 4.
for j,e in enumerate(E):s+=f'<g transform="translate({32+j*50} 324) scale({component_size/100})">{inner(card(e))}</g>'
for j,a in enumerate(['movement','attack','ultimate']):s+=f'<g transform="translate({270+j*50} 324)"><rect x=".5" y=".5" width="45" height="45" rx="4.6" fill="#fff9e9" stroke="#b8ba9d"/><g transform="translate(6.5 6.5) scale(.33)" style="color:{"#d7ae43" if a=="ultimate" else "#24352c"}">{inner(glyph(a))}</g></g>'
for x,y,tone in [(349,22,'#d1d8be'),(347,18,'#a0b79c'),(345,14,'#37654f')]:
 s+=f'<rect x="{x+.5}" y="{y+.5}" width="{component_size-1}" height="{component_size-1}" rx="4.6" fill="{tone}" stroke="#7f9981" stroke-width="1"/>'
s+='<path d="m368 23 10 14-10 14-10-14Z" fill="#dbdfbd"/>'
s+=f'<g transform="translate(345 91) scale({component_size/100})">{inner(card("earth"))}</g>'
s+='<g transform="translate(344 168)"><rect width="54" height="72" rx="4" fill="#fff9e9" stroke="#a9b69a" stroke-width="1.3"/><text x="27" y="11" text-anchor="middle" fill="#29443b" font-size="6" font-weight="700">ПАМЯТКА</text>'
for j,e in enumerate(E):s+=f'<g transform="translate({5+j*12} 14) scale(.095)" style="color:{C[e]}">{inner(A["elements"][e])}</g>'
for j,e in enumerate(E):
 for k,a in enumerate(['movement','attack','ultimate']):s+=f'<g transform="translate({4+k*17} {27+j*10}) scale(.095)" style="color:{C[e]}">{A["diagrams"][e+"-"+a]}</g>'
s+='</g>'
s+='<g transform="translate(352 253) scale(.9)" fill="#6b97ad"><path d="M9 3a3 3 0 1 1 6 0v3l7 6-3 3-4-3 4 10h-6l-1-6-1 6H5l4-10-4 3-3-3 7-6Z"/></g>'
for x in [344,356,368,380]:s+=f'<g transform="translate({x} 285) scale(1)" fill="#ce735d" stroke="#a85b4a" stroke-width=".7"><path d="M12 21S2 14 2 8a5 5 0 0 1 10-2A5 5 0 0 1 22 8c0 6-10 13-10 13Z"/></g>'

for x,y,n in [(22,22,1),(24,324,2),(262,324,3),(337,16,4),(337,94,5),(337,170,6),(344,253,7)]:s+=badge(x,y,n)
page('Знакомство с компонентами','Что лежит на столе',svg(s,'0 0 420 376','table-layout')+
 '<div class="legend"><p><b>1. Арена.</b> Квадратные тайлы, базы и фишки магов.</p><p><b>2. Ваша рука.</b> Карты четырёх стихий.</p><p><b>3. Карты типов.</b> Движение, атака и ультимейт: по одной каждого типа на игрока.</p><p><b>4. Колода стихий.</b> Общий запас для добора.</p><p><b>5. Сброс.</b> Сыгранные и оставшиеся после гибели карты.</p><p><b>6. Памятка.</b> Краткий порядок ходов и схемы эффектов. Памятки для вырезания доступны отдельным печатным листом.</p><p><b>7. Запас игрока.</b> Четыре жетона здоровья, жетон запасной жизни, указатель щита и место для корон. В начале корон нет.</p></div>'+small('Рисунок показывает расположение компонентов, а не фиксированную раскладку тайлов. Карты стихий и типов показаны открытыми для знакомства.'))
page('Подготовка','Соберите арену',
 '<div class="stats"><div><b>4</b>здоровья</div><div><b>2</b>жизни</div><div><b>4</b>карты</div><div><b>2</b>хода</div></div>'+p('Основной вариант этой брошюры: два хода <b>с разными типами действий</b>, четыре карты в руке и одно возрождение. Две жизни означают текущую жизнь и одну запасную.')+
 '<table><thead><tr><th>Игроков</th><th>Арена</th><th>Каждой<br>стихийной клетки</th><th>Каждого<br>препятствия</th><th>Карт каждой<br>стихии</th></tr></thead><tbody>'+''.join(f'<tr><td>{n}</td><td>{z}×{z}</td><td>{(z-2)//2}</td><td>{z-2}</td><td>{cards}</td></tr>' for n,z,cards in [('2',4,'3'),('3-4',6,'4-5'),('5-6',8,'6-7'),('7-8',10,'8-9')])+'</tbody></table>'+small('Баз нужно по одной на игрока. Карт каждой стихии - на одну больше, чем игроков. Стихийные клетки: лужа, пустыня, воздушный остров, лес. Препятствия: стена, шипы, хрупкий пол. Остальное - обычный пол.')+
 steps(['Перемешайте нужные тайлы и соберите квадрат указанного размера. Число баз равно числу игроков.','Случайно распределите магов по разным базам. На одной клетке может стоять только один маг.','Если с базы нельзя выйти ни одним движением, откройте прямой путь длиной в две клетки: замените стены или провалы на нём обычным полом.','Перемешайте карты стихий и раздайте каждому по четыре. Остальные положите общей закрытой колодой. Рядом оставьте место для сброса.','Каждый берёт три карты типов, отмечает 4 здоровья и 2 жизни. Место за столом сохраняйте: оно понадобится только при распределении наград.']))
page('Карты и направления','Одна стихия,<br>разные действия',
 cols('<div class="large-card">'+card('water')+'</div>', '<h3>Карта стихии</h3>'+p('На одной половине нарисовано движение, на другой - обычная атака. Выберите, как использовать карту: действие задаёт отдельная карта типа.')+p('Любую стихию можно повернуть в одну из четырёх сторон. Для обеих половин карты «вперёд» - к её верхнему краю.'))+
 '<div class="type-row">'+''.join('<div>'+actioncard(a)+'<b>'+n+'</b></div>' for a,n in [('movement','Движение'),('attack','Атака'),('ultimate','Ультимейт')])+'</div>'+
 p('<b>Ультимейт</b> - усиленная атака выбранной стихии. Для неё нужна корона; обычная атака нарисована на карте, а эффект ультимейта - в памятке на стр. 9-10.')+
 note('«Впереди», «справа» и «слева» всегда отсчитывайте от направления выбранной карты, а не от своего места за столом.')+
 cols(svg(token(50,54,'А')+line(50,38,50,12)+'<text x="72" y="53" font-size="9" fill="#29483d">право</text><text x="3" y="53" font-size="9" fill="#29483d">лево</text>','0 0 110 90','facing'),p('На схемах круг с буквой - маг. Стрелка показывает перемещение или направление эффекта. Цифра в клетке - урон <b>до учёта защиты и уязвимости</b>.')))
page('Начало раунда','Запланируйте<br>два хода',steps([
 '<b>Выберите первую карту стихии.</b> Определите её тип и направление. Подготовьте пару «стихия + тип», не показывая её соперникам.',
 '<b>Выберите вторую карту.</b> Нужна другая физическая карта, но стихию можно повторить. Тип должен отличаться от первого: движение, атака и ультимейт считаются тремя разными типами.',
 '<b>Положите обе пары закрытыми.</b> Отметьте их порядок: первый ход слева, второе справа. Сохраните выбранное направление, а планы скройте за ширмой или под прикрытием руки.',
 '<b>Объявите готовность.</b> Пока готовы не все, можно забрать свой план и составить заново. Как только готовы все, изменения закончены.'
 ])+
 '<div class="plan-example"><div><b>01 · Движение</b>'+card('air')+actioncard('movement')+'</div><span>→</span><div><b>02 · Атака</b>'+card('fire')+actioncard('attack')+'</div></div>'+
 p('Пример: сначала шаг Воздуха, затем атака Огня. Огненный шар полетит <b>с той клетки, где вы окажетесь после первого хода</b>, а не со стартовой позиции.')+
 note('Учитывайте планы соперников: они могут вытолкнуть вас или занять нужную клетку. Неудачное действие всё равно расходует карту.')+
 small('Карты типов - многоразовые указатели. В общий сброс уходят только карты стихий. Обе пары раскрываются вместе; короны тратятся при фактическом выполнении ультимейта.'))
order=''.join(f'<span>{icon(e)}<b>{N[e]}</b></span>'+(' <i>→</i> ' if e!='fire' else '') for e in E)
page('Разрешение планов','Все действуют<br>по одним фазам',
 '<div class="cycle"><b>ПЕРВЫЙ ХОД · 8 ФАЗ</b><div class="phase-pair"><div><h3>Движения</h3><div class="order">'+order+'</div></div><div><h3>Атаки и ультимейты</h3><div class="order">'+order+'</div></div></div></div><div class="repeat">↓ Тот же полный цикл для второго хода ↓</div>'+
 p('В одном раунде каждый планирует два хода. Каждый ход состоит из восьми фаз: четыре фазы движения и четыре фазы атак.')+p('<b>Сначала раскройте все планы</b> и уберите обе выбранные карты стихий каждого игрока в сброс. Затем разыгрывайте фазы по схеме. Пропускайте стихии, которые никто не выбрал.')+
 p('<b>Внутри одной стихии действия одновременны.</b> Проверяйте их по общей позиции в начале этой фазы. Если два мага обычным движением идут в одну клетку, оба остаются на месте без урона за столкновение. Обмен клетками разрешён, если туда не направляется кто-то ещё.')+
 p('<b>Атаки одной стихии сначала выполняются все.</b> Затем вместе применяются их урон и лечение. Даже смертельно раненый маг успевает атаковать в этой же группе; в следующих фазах он уже не участвует.')+
 cols(board(3,tokens=[(2,0,'А','#3d8271'),(2,2,'Б','#c86e57')],arrows=[(2,0,1,1),(2,2,1,1)]),'<h3>Одна цель для двух магов</h3>'+p('Оба движения Воздуха нацелены в центр: оба отменяются. Порядок мест за столом ничего не меняет.'))+
 note('Между первым и вторым ходом нет ни добора, ни возрождения. Направленный щит первого хода снимается перед началом второго.'))
# Element action pages.
movement={
'air':('Шаг по диагонали','Сдвиньтесь на одну клетку <b>вперёд-вправо</b> относительно карты. Если там стена или остающийся на месте маг, оставайтесь на своей клетке.'),
'earth':('Направленный щит','Останьтесь на месте. Поставьте щит в направлении карты: он остановит атаки и толчки спереди и с двух передних диагоналей. Подробности на стр. 10.'),
'water':('Шаг с выталкиванием','Сделайте шаг вперёд. Если клетка занята, попробуйте вытолкнуть стоящего на ней мага и всю цепочку за ним. Если сдвиг не удался, вы тоже остаётесь.'),
'fire':('Прыжок через клетку','Перепрыгните на две клетки вперёд. Промежуточную клетку игнорируйте: над стеной, магом, шипами и провалом можно пролететь.')}
attacks={
'air':('Толчок трёх соседей','Воздействуйте на соседей <b>спереди, справа и слева</b>. Каждого сдвиньте на одну клетку в направлении карты. Сам толчок не наносит урона, кроме уязвимости воздушного острова.'),
'earth':('Удар на соседнюю клетку','Нанесите <b>2 урона</b> магу прямо впереди на соседней клетке. По диагонали и через одну клетку удар не действует.'),
'water':('Волна на две клетки','Нанесите по <b>1 урону</b> магам на двух клетках подряд впереди. Стена останавливает волну. Полностью защищённый первый маг не пропускает её дальше.'),
'fire':('Огненный шар','Пустите шар прямо вперёд до первого мага или стены. Маг получает <b>1 урон</b>. За цель шар не летит. Без столкновения он уходит за край арены.')}
ultimates={
'air':('Четыре толчка наружу','Четыре диагональных соседа выталкиваются на одну клетку <b>по диагонали от вас</b>. Направление карты не меняет эту симметричную область.'),
'earth':('Летящий кулак','Удар идёт прямо до первого мага или стены. Первый встреченный маг получает <b>2 урона</b>. За него удар не проходит.'),
'water':('Волна с лечением','Атакуйте как обычной волной. Если она попала хотя бы в одного незащищённого мага, восстановите себе <b>1 здоровье</b>, один раз за волну, не выше четырёх.'),
'fire':('Огненный шар со взрывом','Первый маг или стена вызывают взрыв. В клетке столкновения и в четырёх соседних по прямой - по <b>1 урону</b>. Как работает защита, см. стр. 10.')}
for kind,kicker,title,content in [('movement','Первая половина карты','Движения',movement),('attack','Вторая половина карты','Обычные атаки',attacks),('ultimate','Одна корона + одна карта стихии','Ультимейты',ultimates)]:
 boxes=''
 for e in E:
  subtitle,txt=content[e]
  boxes+=panel(icon(e)+N[e],'<div class="art-pair">'+art(e,kind)+f'<div style="color:{C[e]}">'+diagram(e,kind)+'</div></div><h4>'+subtitle+'</h4>'+p(txt))
 end={'movement':'Проверяйте конечную клетку: в стену или занятую клетку нельзя приземлиться. Провал либо выход за край отнимает жизнь. Огонь не страдает от промежуточных клеток.','attack':'1 урон снимает 1 здоровье. Сначала проверьте щит и защиту клетки, затем добавьте уязвимость. При нуле здоровья маг теряет жизнь (стр. 14).','ultimate':'В начале партии корон нет. Одну вы получите при возрождении; другие можно отнять у убитого мага. На один выполненный ультимейт тратится одна корона. Без короны запланировать его нельзя.'}[kind]
 page(kicker,title,'<div class="grid-four">'+boxes+'</div>'+note(end))
# Shield and fire direction diagrams, shield front north.
sh=inner(board(3,tokens=[(1,1,'А','#3d8271')],size=210))
for r,c in [(0,0),(0,1),(0,2)]:sh+=f'<rect x="{c*70+3}" y="{r*70+3}" width="64" height="64" fill="#a9c697" fill-opacity=".48"/>'+line((c+.5)*70,(r+.5)*70,105+(c-1)*16,84,'#416f57')
sh+='<path d="M79 83Q105 53 131 83" stroke="#29483d" stroke-width="7" fill="none"/>'
f=inner(board(4,tiles={(1,2):'wall'},size=240))
f+=line(150,197,150,104,C['fire'])
for x,y in [(107,90),(210,90),(150,47),(150,150)]:f+=line(150,90,x,y,C['fire'])
f+=token(150,210,'А','#3d8271',15)+token(90,90,'Б','#c86e57',15)+token(150,30,'В','#508fa9',15)
f+='<circle cx="150" cy="90" r="11" fill="#efb85e" stroke="#fffbed" stroke-width="3"/>'
page('Направление попадания','Щит и огненный взрыв',
 cols(svg(sh,'0 0 210 210','example-board'),'<h3>Щит смотрит вверх</h3>'+p('Он закрывает три направления со стороны верхнего края. Удар строго справа, слева или сзади проходит.')+p('Щит не требует короны. Он действует до конца <b>текущего хода</b>, но не переносится на следующее.'))+
 note('Проверяйте, <b>откуда прилетает попадание</b>, а не где находится атакующий. При взрыве Огня это особенно важно.')+
 cols(svg(f,'0 0 240 240','example-board'),'<h3>Четыре вторичных шара</h3>'+p('Основной шар А попал в стену. Из её клетки летят четыре шара ровно на одну соседнюю клетку; Б и В проверяют защиту со стороны стены.'))+
 p('Щит или стихийная клетка могут защитить мага в центре попадания, но <b>взрыв всё равно возникает</b>. Вторичные шары дальше соседней клетки не летят и новых взрывов не вызывают. Они могут попасть и в атакующего.')+
 small('Если щит Б обращён вправо, к стене, он остановит вторичный шар. Щит, обращённый вниз к первоначальному атакующему, этого шара не остановит. Без столкновения основного шара взрыва нет.'))
# Push explanation diagrams as before/after.
page('Выталкивание','Когда маги<br>сталкиваются',
 cols(board(4,tokens=[(2,0,'А','#3d8271'),(2,1,'Б','#c86e57'),(2,2,'В','#508fa9')],arrows=[(2,0,2,1),(2,1,2,2),(2,2,2,3)]),'<h3>Вся цепочка сдвигается</h3>'+p('Водное движение А выталкивает Б, а тот - В. А занимает место Б. Каждый продвигается на одну клетку в сторону толчка. Так же продолжается воздушный толчок.'))+
 cols(board(4,tiles={(2,3):'wall'},tokens=[(2,0,'А','#3d8271'),(2,1,'Б','#c86e57'),(2,2,'В','#508fa9')],arrows=[(2,0,2,1)],marks='<g fill="#b94f3b" font-size="17" font-weight="800" text-anchor="middle"><text x="105" y="150">−1</text><text x="175" y="150">−1</text></g>'),'<h3>Стена останавливает всех</h3>'+p('Цепочка не двигается. Б и В получают по <b>1 урону</b> от столкновения. А, выполняющий движение Воды, этот урон не получает.'))+
 p('Направленный навстречу толчку щит тоже останавливает цепочку. Его владелец урон столкновения не получает; выталкиваемые перед ним получают по 1 урону. Защита стихийной клетки от этого урона не спасает.')+
 p('Если в результате одновременных толчков маги должны занять одну клетку, такой сдвиг отменяется и столкновение причиняет урон. При обычном движении в одну клетку урона за конфликт нет.')+
 note('Одновременные воздушные толчки складываются по направлениям. Противоположные могут погасить друг друга. Если крайний маг падает в провал или за край, остальные занимают освобождённые клетки.'))
page('Особые тайлы','Клетка меняет<br>получаемый удар',
 p('Эффект относится к магу, который <b>стоит на клетке в момент попадания</b>. Он не усиливает атаки этого мага.')+
 '<div class="terrain-grid">'+''.join(panel(name,'<div class="terrain-large">'+A['terrain'][t]+'</div>'+p(f'<b>Уязвимость:</b> {weak}.<br><b>Защита:</b> {protect}.')) for t,name,weak,protect in [('puddle','Лужа','Вода наносит на 1 урон больше','от Огня'),('desert','Пустыня','Земля наносит на 1 урон больше','от Воды'),('air_island','Воздушный остров','Воздух наносит 1 урон сверх толчка','от Земли'),('forest','Лес','Огонь наносит на 1 урон больше','от Воздуха')])+'</div>'+
 note('<b>Меч +1</b> - уязвимость стоящего здесь мага.<br><b>Щит стихии</b> - полная защита от этой стихии со всех сторон: нет ни попадания, ни прямого толчка её атакой.')+
 p('Пример: обычная волна Воды причиняет магу на луже <b>2 урона</b> вместо 1. Но если её останавливает направленный щит мага, урона нет вовсе.')+
 small('Защита стихии не отменяет шипы, столкновения или падение. Она также не мешает сдвигу от движения Воды и от другого выталкиваемого мага.'))
page('Другие тайлы','Пол под ногами<br>тоже опасен',
 '<div class="tile-list">'+''.join('<div class="tile-line"><div>'+A['terrain'][t]+'</div><section><h3>'+name+'</h3>'+p(txt)+'</section></div>' for t,name,txt in [
 ('ground','Обычный пол','Никаких дополнительных эффектов. Обычный пол не усиливает и не ослабляет попадания.'),
 ('base','База','Стартовая клетка и место возрождения. Занятая база недоступна для возвращения. Стоящий на базе маг не получает особой защиты.'),
 ('wall','Стена','Занять её нельзя. Она останавливает движение, выталкивание и летящие атаки. Огонь может перепрыгнуть над ней, если место приземления свободно.'),
 ('spikes','Шипы','Снимите 1 здоровье при каждом входе: своим движением или от толчка. Если просто стоите на шипах, снова платить здоровье не нужно.'),
 ('falling_floor','Хрупкий пол','После ухода мага тайл исчезает и превращается в провал. При выталкивании следующий за ним маг может попасть уже в образовавшуюся пустоту.')])+'</div>'+
 note('<b>Провал и край арены.</b> Шаг, приземление или толчок в пустоту сразу отнимает жизнь при любом оставшемся здоровье. Ни щит, ни защита клетки от падения не спасают.'))
page('Гибель и награды','Что получает убийца',
 p('При нуле здоровья или падении маг <b>теряет одну жизнь</b> и снимается с поля. В оставшихся ходах раунда он больше не участвует. Если жизнь ещё есть, он сможет возродиться после завершения раунда.')+
 '<div class="reward-flow"><span>Гибель</span>→<span>Награды</span>→<span>Сброс руки</span>→<span>Возрождение</span></div>'+
 steps(['<b>Определите убийц.</b> Ими считаются соперники, причинившие смертельный урон этой группы атак, в том числе при избыточном уроне. Падение или гибель на шипах от толчка засчитываются толкнувшим. Сам погибший и окончательно выбывшие наград не получают. Одновременно погибший маг с запасной жизнью получить награду может.',
 '<b>Раздайте прежние короны.</b> Все непотраченные короны погибшего распределите между убийцами по одной по часовой стрелке от его места. Повторяйте круг, пока короны не закончатся. Если убийц нет, короны исчезают.',
 '<b>Выберите карты награды.</b> В том же порядке каждый убийца вслепую берёт одну оставшуюся карту из руки погибшего. Каждая фактически полученная карта увеличивает его личный лимит руки на один. Если карты не хватило, лимит не растёт.',
 '<b>Сбросьте остальные карты погибшего.</b> Он не сохраняет прежнюю руку, даже если у него осталась жизнь. Уже сыгранные карты в награды не входят.'
 ])+
 '<div class="crown-example"><span>'+glyph('ultimate')+'</span><p><b>Две короны до гибели → две короны убийце.</b><br>У погибшего не остаётся прежних корон. При возрождении он получит ровно одну новую.</p></div>'+
 small('В результатах приложения отдельно считается урон другим магам. Падение от толчка даёт урон по оставшемуся здоровью жертвы. При совместном толчке он делится поровну: 3 здоровья и два толкнувших - по 1,5 каждому. Урон не определяет места.'))
page('Между раундами','Возвращение,<br>сжатие и победа',
 '<h3>Вернитесь на свободную базу</h3>'+p('После обоих ходов и наград маги с оставшимися жизнями выбирают свободные базы. На каждом новом этапе <b>случайно определяйте очередь</b> этих магов. После отдельного выбора её не меняйте.')+
 p('Верните мага на базу: 4 здоровья, <b>одна новая корона</b>, новая рука до личного лимита с учётом наград. Все базы заняты - ждите свободной. Баз больше нет - маг окончательно выбывает.')+
 '<h3>Подготовьте следующий раунд</h3>'+p('Замешайте сброс в колоду. Оставшиеся на поле маги получают по две карты взамен потраченных; награды за убийства сохраняют. Возродившиеся уже набрали руку и дополнительно не добирают. Ждущим базы карты не выдают. При нехватке колоды выдавайте имеющиеся.')+
 '<h3>Арена становится меньше</h3>'+cols(board(6,marks='<path d="M0 0H280V280H0Z M46.67 46.67V233.33H233.33V46.67Z" fill="#c47754" fill-rule="evenodd" fill-opacity=".45"/><rect x="47" y="47" width="186" height="186" fill="none" stroke="#29483d" stroke-width="3"/>'),p('Пример: 6×6 превращается в 4×4. Красное кольцо исчезает. На краю нельзя оставаться.'))+p('Когда окончательно выбывших достаточно для меньшей арены (стр. 3), проведите полный раунд с предупреждением. Затем уберите внешнее кольцо со стенами и базами. Маги на нём падают и теряют жизнь. Перед каждым новым сжатием снова предупреждайте.')+
 note('<b>Побеждает последний участник с хотя бы одной жизнью.</b> Если все окончательно выбыли одновременно, это ничья. Выбывшие в одном раунде делят место; остальные места зависят от длительности выживания.')+
 small('Вытолкнувший мага на обрушающийся край в этом же раунде может получить убийство, если маг так и остался там. Щит от обрушения не защищает.'))
page('Памятка на стол','Весь раунд<br>перед глазами',
 steps(['<b>План.</b> Выберите две разные карты и два разных типа. Задайте направление каждой. Пока не готовы все, можно изменить выбор.',
 '<b>Раскрытие.</b> Покажите планы вместе. Обе карты стихий каждого мага уходят в сброс.',
 '<b>Первый ход.</b> Движения: Воздух → Земля → Вода → Огонь. Затем атаки и ультимейты в том же порядке. В одной стихии всё одновременно.',
 '<b>Второй ход.</b> Снимите старые щиты. Повторите полный цикл с текущих позиций. Погибшие не действуют.',
 '<b>Конец раунда.</b> Если было предупреждение - обрушьте край. Распределите награды, выберите базы для возрождения, восстановите руки. Проверьте победу и новое предупреждение о сжатии.'
 ])+
 '<div class="mini-cards">'+''.join('<div>'+card(e)+'<b>'+N[e]+'</b></div>' for e in E)+'</div>'+
 '<hr><h3>Выбранные правила и варианты</h3><div class="settings"><span>Ходов: <b>2</b></span><span>Типы: <b>разные</b></span><span>Здоровье: <b>4</b></span><span>Жизней: <b>2</b></span><span>Стартовая рука: <b>4</b></span></div>'+
 small('В приложении можно выбрать 1 или 2 хода, одинаковые или разные типы, 1-6 здоровья, 1-4 жизни и 2-8 стартовых карт. При автонастройке один ход даёт 3 здоровья и 3 карты, два - 4 и 4. Размер арены и смысл эффектов не меняются. Для физического варианта с другой рукой нужно отдельно пересчитать число карт.')+
 '<div class="edition">Макет для согласования · редакция 1 · 27 октября 2026<br>По реализации пака mage-brawl 0.2.4. Иллюстрации - из пака ХОД.<br>© GraphGiraffe · Условия использования: packs/mage-brawl/LICENSING.md</div>')
memo='<h2>Стихийная потасовка</h2><div class="memo-order"><div><b>Движения</b><div class="order">'+order+'</div></div><div><b>Атаки / ульты</b><div class="order">'+order+'</div></div></div><div class="memo-matrix"><div></div><b>'+glyph('movement')+'</b><b>'+glyph('attack')+'</b><b style="color:#d7ae43">'+glyph('ultimate')+'</b>'+''.join('<div class="memo-element">'+icon(e)+'<span>'+N[e]+'</span></div>'+''.join('<div style="color:'+C[e]+'">'+diagram(e,a)+'</div>' for a in ['movement','attack','ultimate']) for e in E)+'</div>'
P.append('<section class="page memo-sheet"><div class="body memo-four">'+''.join('<article class="memo-card">'+memo+'</article>' for _ in range(4))+'</div><footer><span>ПАМЯТКИ ДЛЯ ВЫРЕЗАНИЯ · A5 · РЕДАКЦИЯ 1</span><b>17</b></footer></section>')
CSS='''
@page{size:148mm 210mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;color:#29443b;background:#deded3;font-family:"Noto Sans",Arial,sans-serif;font-size:9pt;line-height:1.42}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:148mm;height:210mm;margin:8mm auto;background:#f6f2e7;position:relative;padding:11mm 12mm 13mm;break-after:page;box-shadow:0 3px 18px #0002}.page:last-child{break-after:auto}.body{position:relative}.eyebrow{font-size:7pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#7e8b78;margin-bottom:4mm}h1{font-size:25pt;line-height:1.1;letter-spacing:-.7px;margin:0 0 5mm;font-weight:800}h3{font-size:11pt;line-height:1.22;margin:3mm 0 2mm}h4{font-size:9pt;line-height:1.3;margin:2mm 0}p{margin:0 0 3mm}b{font-weight:750}.small{font-size:7.7pt;line-height:1.4;color:#677569}.cols{display:grid;grid-template-columns:1fr 1fr;gap:5mm;align-items:center;margin:3mm 0}.cols>div{min-width:0}svg{display:block;width:100%;height:auto;overflow:visible}footer{position:absolute;left:12mm;right:12mm;bottom:6mm;display:flex;align-items:center;justify-content:space-between;border-top:.25mm solid #d8dbca;padding-top:2mm;font-size:5.5pt;letter-spacing:.7px;color:#79836f}footer b{font-size:8pt;color:#29443b}aside{padding:3mm 3.5mm;background:#e6ecd9;border-left:1mm solid #6d9276;border-radius:0 2mm 2mm 0;margin:3mm 0;font-size:8.4pt;line-height:1.45}.cover h1{font-size:32pt;line-height:1.02;letter-spacing:-1px}.cover-art{display:block;width:118mm;height:65mm;object-fit:contain;margin:-1mm auto 2mm}.invitation{font-size:9pt}.invitation>b{font-size:12pt}.invitation p{margin-top:3mm}.cover-stats{display:flex;justify-content:space-between;border-top:.25mm solid #d8dbca;border-bottom:.25mm solid #d8dbca;padding:3mm 0;margin:5mm 0;font-size:8pt;font-weight:700}.table-layout{height:102mm;margin:0 auto 2mm}.legend{columns:2;column-gap:5mm;font-size:8pt}.legend p{break-inside:avoid;margin-bottom:2mm}.stats{display:flex;justify-content:space-between;background:#e4ead7;padding:3mm;margin:0 0 4mm;border-radius:3mm}.stats div{text-align:center;font-size:8pt}.stats b{display:block;font-size:21pt;line-height:1.1}table{border-collapse:collapse;width:100%;font-size:7.6pt;margin:4mm 0}th,td{text-align:center;border-bottom:.25mm solid #d9ddcc;padding:1.8mm .6mm}th{font-size:6.4pt;color:#677569;font-weight:700;line-height:1.25}.steps{padding-left:6mm;margin:3mm 0}.steps li{padding-left:1mm;margin-bottom:3mm}.steps li::marker{font-weight:800;color:#739076}.large-card{width:45mm;margin:auto}.type-row{display:flex;gap:8mm;justify-content:center;margin:3mm 0 4mm;text-align:center;font-size:8pt}.type-card{width:18mm;height:18mm;border:.5mm solid #aeb89c;border-radius:3mm;background:#fff9e9;display:inline-flex;align-items:center;justify-content:center;color:#29483d}.type-card svg{width:12mm;height:12mm}.type-row b{display:block;margin-top:1mm}.facing{height:28mm}.element{display:inline-block;width:6mm;height:6mm;vertical-align:middle;margin-right:2mm}.plan-example{display:flex;align-items:center;justify-content:center;gap:3mm;margin:4mm 0}.plan-example>div{width:48mm;text-align:center}.plan-example b{font-size:8pt;display:block;margin-bottom:2mm}.plan-example .spell-card{width:31mm;display:inline-block;vertical-align:middle}.plan-example .type-card{width:12mm;height:12mm;vertical-align:middle}.plan-example .type-card svg{width:8mm;height:8mm}.plan-example>span{font-size:18pt}.cycle{padding:3mm;background:#e7ecdb;border-radius:3mm}.cycle>b{font-size:7pt;letter-spacing:1px}.cycle h3{margin:2mm 0}.order{display:flex;align-items:center;justify-content:space-between}.order span{display:flex;flex-direction:column;align-items:center;font-size:6.5pt}.order .element{margin:0;width:6mm}.order i{font-style:normal;color:#8b927d}.repeat{text-align:center;font-weight:700;font-size:8pt;padding:3mm 0}.board{width:100%}.grid-four{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.panel{padding:3mm;border:.3mm solid #d6dcc9;border-radius:3mm;background:#eeeedf;break-inside:avoid}.panel h3{margin:0 0 1mm;font-size:12pt}.panel p{font-size:8.3pt;line-height:1.42;margin:0}.art-pair{display:flex;align-items:center;gap:1mm;height:29mm}.art-pair>.spell-art{width:25mm}.art-pair>div{width:26mm}.diagram{color:inherit}.mage-diagram-arrow-halo{stroke:#fffbed;color:#fffbed}.mage-diagram-arrow-halo path{stroke:#fffbed;stroke-width:9;fill:none}.example-board{height:47mm}.terrain-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.terrain-large{width:29mm;margin:2mm auto}.terrain-grid .panel p{font-size:8pt}.tile-line{display:grid;grid-template-columns:19mm 1fr;gap:4mm;margin:0 0 3mm;align-items:start}.tile-line h3{margin:0 0 1mm}.tile-line p{font-size:8.5pt;margin:0}.tile-line>div{padding-top:1mm}.reward-flow{display:flex;align-items:center;justify-content:space-between;gap:1mm;background:#e4ead7;padding:2mm;border-radius:2mm;font-size:7pt;font-weight:700}.crown-example{display:flex;align-items:center;gap:3mm;background:#f0e2bb;padding:3mm;border-radius:3mm;margin:4mm 0}.crown-example>span{display:block;min-width:12mm;width:12mm;color:#aa844b}.crown-example p{font-size:8pt;margin:0}.mini-cards{display:flex;gap:4mm;margin:4mm 0;text-align:center;font-size:7pt}.mini-cards>div{flex:1;min-width:0}.mini-cards b{display:block;margin-top:1mm}hr{border:0;border-top:.35mm solid #c7ceba;margin:3mm 0}.settings{display:flex;gap:1.5mm;flex-wrap:wrap;margin:2mm 0 3mm}.settings span{background:#e4ead7;border:.25mm solid #c9d2b9;padding:1.4mm 2mm;border-radius:1mm;font-size:7pt}.edition{font-size:5.8pt;line-height:1.5;color:#7c8677;margin-top:4mm}.page:nth-child(3) table{margin:2mm 0}.page:nth-child(3) th,.page:nth-child(3) td{padding:1mm .5mm}.page:nth-child(3) .steps{font-size:9pt}.page:nth-child(3) th{font-size:7.2pt}.page:nth-child(3) td{font-size:8.4pt}.page:nth-child(3) .steps li{margin-bottom:2mm}.page:nth-child(15) .cols .board{height:27mm}.page:nth-child(15) .cols{grid-template-columns:29mm 1fr;gap:3mm;margin:1mm 0}.page:nth-child(15) .cols p{font-size:8pt}.page:nth-child(15) p{margin-bottom:2.3mm}.page:nth-child(6) .cols .board{height:25mm}.page:nth-child(6) .cols p{font-size:8pt}.page:nth-child(6) .cycle{padding:2mm}.grid-four .art-pair{height:24mm}.grid-four .art-pair>.spell-art{width:21mm}.grid-four .art-pair>div{width:23mm}.page:nth-child(11) .cols .board{height:40mm}.page:nth-child(11) .cols p{font-size:8.3pt}.page:nth-child(12) .terrain-large{width:21mm}.page:nth-child(12) .panel{padding:2.5mm}.page:nth-child(12) aside{font-size:8pt;margin:2mm 0}.type-card.ultimate{color:#d7ae43}.crown-example>span{color:#d7ae43}.phase-pair{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.phase-pair>div{border:.25mm solid #cbd5c0;border-radius:2mm;padding:2mm}.phase-pair h3{font-size:8pt}.phase-pair .order{gap:.6mm;justify-content:center}.phase-pair .order span{font-size:5pt}.phase-pair .order .element{width:4mm;height:4mm}.phase-pair .order i{font-size:7pt}.page:nth-child(6) .cols{margin:1mm 0}.page:nth-child(6) p{margin-bottom:2mm}@page memo{size:148mm 210mm;margin:0}.memo-sheet{page:memo;width:148mm;height:210mm;padding:3mm}.memo-sheet footer{left:3mm;right:3mm;bottom:2mm;font-size:3pt;letter-spacing:.3px;padding-top:.5mm}.memo-four{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(2,minmax(0,1fr));height:198mm}.memo-card{min-height:0;border:.175mm dashed #b4bdab;padding:2mm;overflow:hidden}.memo-card h2{margin:0 0 1mm;font-size:9.1pt}.memo-order{display:grid;grid-template-columns:1fr 1fr;gap:.7mm;font-size:5.4pt;margin-bottom:.7mm}.memo-order .order{justify-content:center;gap:.3mm}.memo-order .order span{font-size:0}.memo-order .element{width:5mm;height:5mm}.memo-matrix{display:grid;grid-template-columns:7.5mm repeat(3,1fr);gap:.3mm;align-items:center}.memo-matrix>div:not(.memo-element){height:18mm}.memo-matrix>div>.diagram{height:18mm}.memo-matrix>div:first-child{height:6mm}.memo-matrix>b{height:6mm;text-align:center}.memo-matrix>b>svg{height:6mm}.memo-element{font-size:4.4pt;text-align:center}.memo-element .element{display:block;margin:auto;width:5mm;height:5mm}@media print{html,body{background:#f6f2e7}.page{margin:0;box-shadow:none}}
'''
htmltext='<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Стихийная потасовка · Правила игры</title><style>'+CSS+'</style><body>'+''.join(P)+'</body></html>'
(OUT/'rulebook.html').write_text(htmltext)
# Save reusable vector illustrations separately as future embedding inputs.
artdir=OUT/'art';artdir.mkdir(exist_ok=True)
for e in E:
 (artdir/f'card-{e}.svg').write_text(card(e))
 for a in ['movement','attack','ultimate']:
  (artdir/f'{e}-{a}.svg').write_text(svg(A['illustration'][e+'-'+a]))
  (artdir/f'diagram-{e}-{a}.svg').write_text(svg(A['diagrams'][e+'-'+a]))
for t,markup in A['terrain'].items():(artdir/f'tile-{t}.svg').write_text(svg(inner(markup)))
(OUT/'source-record.json').write_text(json.dumps({'pack':'mage-brawl','version':json.loads((PACK/'manifest.json').read_text())['version'],'sources':{str(x.relative_to(PACK)):hashlib.sha256(x.read_bytes()).hexdigest() for x in [PACK/'domain/game.js',PACK/'view.js',PACK/'locales/ru/game.json',PACK/'assets/covers/arena-v8.webp']},'pages':len(P)},ensure_ascii=False,indent=2))
print(json.dumps({'html':str(OUT/'rulebook.html'),'pages':len(P),'vector_assets':len(list(artdir.glob('*.svg')))},ensure_ascii=False))
