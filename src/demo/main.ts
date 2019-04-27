import * as main from "../main";

main.init(
  [
    String.raw`
Move:

Arrow

[WASD] keys

Slide

###########

#         #

# @     o #
  c     y
#         #

###########

`,
    String.raw`
###########

#   *     #
    r
# @ * * o #
  c r r y
#     *   #
      r
###########

`,
    String.raw`
-----------

|  v   v o|
   r   r g
|         |

|         |

|         |

|@   ^    |
 c   r
-----------

`,
    String.raw`
-----

|@  |
 c
|   |

|   -----

|   | > |
    g r
| < |   |
  r g
|   | < |
    g r
-----   |

    |   |

    |  o|
       y
    -----

`,
    String.raw`
  ########

  #R    o#
   r    y
  # ##   #

  #   L###
      r
###L o##
   r y
# R   #
  r
# ### #

#@    #
 c
#######

`,
    String.raw`
#Fs####
 rr
#v# #@#
 p   c
#   # #

# # # #

# #   #

# # # #

# # # #

#o#^# #
 y p
###Fs##
   rr
`,
    String.raw`
 >
 g
        <
        g
    >
    g


 .^.^. . .
  b b
  F@F
  ccc
TTTTTTTTTTT

`,
    String.raw`
-----------

|         |

|  >      |
   r
|   Z     |
    r
|       < |
        r
|     z   |
      r
|  >      |
   r
|   n     |
    r
| @  < N  |
  c  r r
-----------

`,
    String.raw`
@
g
    @
    g


        @
        g
    &
    c
 @
 g


       @
       g
`,
    String.raw`
[][][][][][][]

[            ]

[          @ ]
           c
[            ]
   
[ H          ]
  r
[HHHRfHHH    ]
 rrrrrrrr
[H  H# #H    ]
 r  r   r
[H  H   H    ]
 r  r   r
[o  H   H    ]
 y  r   r
[][][][][][][]

`,
    String.raw`
<    <    <
r    r    r
| @       |
r c       r
| v       |
r c       r
|         |
r         r
     <    |
     r    r
     |
     r
     |
     r
<    |    
r    r    
|    |    <
r    r    r
HHHHHHHHHHHHHH

`,
    String.raw`
-----

|@  |------
 c
|  <|    <|
   rg    r
------| |--

      | |

     -|-|---
       g
     -     |

     |  Z  |
        r
     -    o|
          y
     -------

`,
    String.raw`
     -|-|---

 -----     |

 |  <|  Z  |
    rg  r
 | |--    @|
          c
 | | -------

-|-|--
  g
|   n|
    r
| ^ o|
  r y
------

`,
    String.raw`
--------

 v     
 r     
      
      
   ^  v
   r  r
      
      
 v
 r
     ^
     r
 ---
 aaa
  @
  a
&&&&&&&&
cccccccc
`,
    String.raw`
*          *
r          r
*^|        *
raa        r
* |        *
r a        r
*        |^*
r        aar
*          *
r          r
*    s@    *
r    cc    r
*    f>    *
r    cc    r
*^|        *
raa        r
*        |^*
r        aar
*        | *
r        a r
`,
    String.raw`
    #######

    #/  <\#
        r
    #  #  #
   
    #-###-#
     y   y
#####  #  #

#/ | v  >/#
   y r  r
#v #  #####
 r
# ### #

#  #  #

#\@  /#
  c
#######

`,
    String.raw`
/        \

\   vf > /
    cc r
/ < @s   \
  r cc
\        /

/  <     \
   r
\        /

/     >  \
      r
\        /

/    <   \
     r
\        /

`,
    String.raw`
+++++++++

+       +

+ == ==L+
       r
+ ==&== +
    c
+  &@&  +
   cac
+R==&== +
 r  c
+ == == +
        
+       +
    
+++++++++

`,
    String.raw`
.|. . . .
 r
 v
 r
       ^
       r
       |
       r


---- ---@
cccc cccc






`,
    String.raw`
---------

       v
       r
N   ^ 
r   r
      Z
      r
 ^
 r


   @  @
   c  c
---------

`,
    String.raw`
  ()()()()()()

  ()  o o   ()
      g g
            ()

            ()

     /@     ()
     aa       
F>   \      ()
cb   aa      
v           ()
c            
F>          ()
cb
            ()

  () o   o  ()
     g   g
  ()()()()()()

`,
    String.raw`
**************
pppppppppppppp
*  vf****    *
p  rrrrrr    p
* o          *
p y          p
*    ^f*   < *
p    rrr   r p
*          * *
p          r p
*>   >     * *
pr   r     r p
*f   *     * *
pr   r     r p
**           *
pr           p
**  @        *
pr  c        p
*          o *
p          y p
*    ****^   *
p    rrrrr   p
**************
pppppppppppppp
`,
    String.raw`
###########

#        o#
         g
s#### #####
r
F->       #
rpp
###### ###s
          r
#      <--F
       pppr
s#### ####s
r         r
F-->      #
rppp
s##### ####
r
#  @      #
   c
###########

`,
    String.raw`
|--------------|

|v> @      <v ||
 rr c      rr y
|-----    -----|

|              |

|-----    -----|

||  <^      ^> |
 y  rr      rr 
|--------------|

`,
    String.raw`
|-------------|

|             |

|             |

|      ^      |
       r
|     Of      |
      rr
|     ---O    |
      rrrr
|    O-|-O    |
     rrrrr
|   F-----F   |
    rrrrrrr
|   v  |  v   |
    p  r  p
|      |      |
       r
| @    |    $ |
  c    r    y
|++++++-++++++|

`,
    String.raw`
=======================

*   <                |
r   p                p
*   |  ============= |
r   p  ppppppppppppp p
*   |  |  <  <     | |
r   p  p  y  y     p p
*   |  |       <   | |
r   p  p       y   p p
*   ====   =====   | |
r   pppp   ppppp   p p
* s@       |   |   | |
r cc       p   p   p p
*   ========   |   ===
r   pppppppp   p   ppp
*   |          |  <  
r   p          p  y
*   |          =======
r   p          ppppppp
*   <                |
r   p                p
=======================

`,
    String.raw`
wwwwwwwwwwwwwwwwwwwww

        | (_f>
        y rrrr
  '\------(oo)
  rrrrrrrrrrrr
    ||    (__)
    rr    rrrr
 |  ||---||        @
 y  rrrrrrr        c
         |  >_f>
         y  rrrr
    '\------(oo)
    rrrrrrrrrrrr
      ||    (__)
      rr    rrrr
    | ||---||
    y rrrrrrr
wwwwwwwwwwwwwwwwwwwww

`
    /*
  ,String.raw`
`,
*/
  ],
  { testingLevel: -1 }
);
