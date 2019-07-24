   
# computation

olen = 10
nlen = 6

if idx < 6 (nlen)  
  route.oldie.push (idx)
else
  route.newly.push (idx - nlen)  

olen = 6
nlen = 10

if idx < 6 (olen)  
  route.oldie.push (idx)
else
  route.newly.push (idx - olen)  

# resolution

3 situations exist:

- 0!0/1 add new tree
- 0/1!0 remove old tree
- 0/1!0/2 update old with new








