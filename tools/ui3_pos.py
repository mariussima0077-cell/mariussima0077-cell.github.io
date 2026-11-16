# helper: % positions of boxes inside a cropped picture (bbox of the keyed sheet)
def P(sel,box,bb,extra=''):
    x0,y0,x1,y1=box;bx,by,bx1,by1=bb;W=bx1-bx;H=by1-by
    f=lambda v:round(v*100,2)
    return f"{sel}{{position:absolute!important;left:{f((x0-bx)/W)}%;top:{f((y0-by)/H)}%;width:{f((x1-x0)/W)}%;height:{f((y1-y0)/H)}%;{extra}}}"
