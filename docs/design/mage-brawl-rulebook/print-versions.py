"""Vector-preserving imposition: 16 A5 rules into an A4 duplex booklet,
plus eight identical memos on one A4 landscape sheet. No rasterisation.
"""
import argparse,copy,json
from pathlib import Path
from pypdf import PdfReader,PdfWriter,Transformation,PageObject
p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
a.out.mkdir(parents=True,exist_ok=True)
r=PdfReader(a.source)
if len(r.pages)!=16:raise ValueError('Expected 16 rules pages without memos')
memo_source=PdfReader(a.source.parent/'Стихийная-потасовка-4-памятки-A5.pdf')
if len(memo_source.pages)!=1:raise ValueError('Expected one separate A5 memo sheet')
W,H=297*72/25.4,210*72/25.4

def half(target,source,index):
 page=copy.copy(source)
 sw,sh=float(page.mediabox.width),float(page.mediabox.height)
 scale=min((W/2)/sw,H/sh)
 x=index*(W/2)+((W/2)-sw*scale)/2;y=(H-sh*scale)/2
 target.merge_transformed_page(page,Transformation().scale(scale).translate(x,y))

book=PdfWriter();order=[]
for sheet in range(4):
 for left,right in [(16-2*sheet,1+2*sheet),(2+2*sheet,15-2*sheet)]:
  side=PageObject.create_blank_page(width=W,height=H)
  half(side,r.pages[left-1],0);half(side,r.pages[right-1],1)
  book.add_page(side);order.append([left,right])
book.add_metadata({'/Title':'Стихийная потасовка - буклет A4, редакция 1','/Subject':'Двусторонняя печать, альбомная A4, переворот по короткому краю, 100%. Спуск уже выполнен.'})
bpath=a.out/'Стихийная-потасовка-буклет-A4.pdf'
with bpath.open('wb') as f:book.write(f)

memo=copy.deepcopy(memo_source.pages[0]);memo.cropbox.lower_left=(0,20)
side=PageObject.create_blank_page(width=W,height=H)
half(side,memo,0);half(side,memo,1)
writer=PdfWriter();writer.add_page(side)
writer.add_metadata({'/Title':'Стихийная потасовка - 8 памяток A4','/Subject':'Односторонняя печать, альбомная A4, 100%. Восемь одинаковых памяток для вырезания.'})
mpath=a.out/'Стихийная-потасовка-8-памяток-A4.pdf'
with mpath.open('wb') as f:writer.write(f)
(a.out/'PRINT.md').write_text('''# Печать редакции 1

## Правила A5

Файл «Стихийная-потасовка-правила.pdf»: 16 страниц A5 без памяток.

## Буклет

Файл «Стихийная-потасовка-буклет-A4.pdf»: 8 сторон, 4 физических листа A4.
Печатать все страницы: A4, альбомная ориентация, двусторонняя печать,
переворот по короткому краю, масштаб 100% (фактический размер),
одна страница PDF на сторону листа. Не включать режим «Буклет» или
дополнительные «2 страницы на лист»: спуск уже сделан.
Страницы правил идут в порядке для сгиба: 16|1, 2|15, 14|3, 4|13,
12|5, 6|11, 10|7, 8|9. Сохранить порядок листов, сложить пачку пополам
и скрепить по сгибу. Настройка порядка выдачи листов зависит от принтера.
Памяток в буклете нет.

## Памятки

Файл «Стихийная-потасовка-4-памятки-A5.pdf»: одна страница A5,
4 памятки. Односторонняя печать, масштаб 100%.

Файл «Стихийная-потасовка-8-памяток-A4.pdf»: одна страница A4,
альбомная ориентация, односторонняя печать, масштаб 100%,
одна страница PDF на лист. На листе два блока A5 рядом,
в каждом четыре одинаковые памятки. Разрезать по пунктирным линиям.
''')
(a.out/'print-layout.json').write_text(json.dumps({'rulesPages':16,'a5MemoPages':1,'a5MemoCount':4,'bookletSides':8,'physicalSheets':4,'pagePairs':order,'memoPages':1,'memoCount':8,'orientation':'landscape','duplexFlip':'short-edge'},indent=2))
print(json.dumps({'booklet':str(bpath),'sides':len(book.pages),'memo':str(mpath),'memoSheets':len(writer.pages),'order':order},ensure_ascii=False))
