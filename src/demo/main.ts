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
`
    /*
  ,String.raw`
`,
*/
  ],
  { testingLevel: -1 }
);
