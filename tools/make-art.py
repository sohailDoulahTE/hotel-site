#!/usr/bin/env python3
"""Generate the site's placeholder artwork as self-contained SVG files.

These are deliberately abstract architectural illustrations so the repository
has zero external dependencies. Replace the files in assets/img/ with real
photographs (same filenames) when you have them.
"""
import os
import textwrap

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
os.makedirs(OUT, exist_ok=True)


def svg(w, h, body, defs=''):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" role="img">\n<defs>{defs}</defs>\n{body}\n</svg>\n'
    )


def grad(gid, c1, c2, angle='135'):
    x2, y2 = ('1', '1') if angle == '135' else ('0', '1')
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="{x2}" y2="{y2}">'
            f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/>'
            f'</linearGradient>')


def window_wall(w, h, cols, rows, c_frame, c_glass, opacity=0.9):
    """A grid of tall windows — reads as a hotel facade / room window."""
    parts = []
    pad_x, pad_y = w * 0.08, h * 0.10
    gw = (w - pad_x * 2) / cols
    gh = (h - pad_y * 2) / rows
    for r in range(rows):
        for c in range(cols):
            x = pad_x + c * gw + gw * 0.08
            y = pad_y + r * gh + gh * 0.08
            parts.append(
                f'<rect x="{x:.1f}" y="{y:.1f}" width="{gw*0.84:.1f}" height="{gh*0.84:.1f}" '
                f'rx="{min(gw,gh)*0.08:.1f}" fill="{c_glass}" opacity="{opacity}"/>'
            )
            parts.append(
                f'<rect x="{x:.1f}" y="{y:.1f}" width="{gw*0.84:.1f}" height="{gh*0.84:.1f}" '
                f'rx="{min(gw,gh)*0.08:.1f}" fill="none" stroke="{c_frame}" stroke-width="2" opacity=".55"/>'
            )
    return ''.join(parts)


def bed_scene(w, h, base, accent, light, wall_cols=3):
    """Abstract hotel room: window wall, headboard, bed, lamps, plant."""
    bed_y = h * 0.60
    return textwrap.dedent(f'''
      <rect width="{w}" height="{h}" fill="url(#bg)"/>
      <g opacity=".55">{window_wall(w, h*0.72, wall_cols, 1, light, '#ffffff', 0.35)}</g>
      <!-- floor -->
      <rect x="0" y="{h*0.72:.0f}" width="{w}" height="{h*0.28:.0f}" fill="{base}" opacity=".22"/>
      <!-- headboard -->
      <rect x="{w*0.22:.0f}" y="{bed_y-h*0.26:.0f}" width="{w*0.56:.0f}" height="{h*0.27:.0f}"
            rx="{h*0.04:.0f}" fill="{accent}" opacity=".40"/>
      <!-- mattress -->
      <rect x="{w*0.20:.0f}" y="{bed_y:.0f}" width="{w*0.60:.0f}" height="{h*0.17:.0f}"
            rx="{h*0.025:.0f}" fill="#ffffff" opacity=".92"/>
      <!-- base -->
      <rect x="{w*0.21:.0f}" y="{bed_y+h*0.16:.0f}" width="{w*0.58:.0f}" height="{h*0.07:.0f}"
            rx="{h*0.012:.0f}" fill="{accent}" opacity=".55"/>
      <!-- runner -->
      <rect x="{w*0.20:.0f}" y="{bed_y+h*0.10:.0f}" width="{w*0.60:.0f}" height="{h*0.045:.0f}"
            fill="{accent}" opacity=".45"/>
      <!-- pillows -->
      <rect x="{w*0.25:.0f}" y="{bed_y-h*0.035:.0f}" width="{w*0.22:.0f}" height="{h*0.075:.0f}"
            rx="{h*0.028:.0f}" fill="#ffffff"/>
      <rect x="{w*0.53:.0f}" y="{bed_y-h*0.035:.0f}" width="{w*0.22:.0f}" height="{h*0.075:.0f}"
            rx="{h*0.028:.0f}" fill="#ffffff"/>
      <!-- side tables + lamps -->
      <rect x="{w*0.10:.0f}" y="{bed_y+h*0.04:.0f}" width="{w*0.08:.0f}" height="{h*0.19:.0f}"
            rx="6" fill="{accent}" opacity=".5"/>
      <circle cx="{w*0.14:.0f}" cy="{bed_y-h*0.01:.0f}" r="{h*0.045:.0f}" fill="#ffd9a0" opacity=".85"/>
      <rect x="{w*0.82:.0f}" y="{bed_y+h*0.04:.0f}" width="{w*0.08:.0f}" height="{h*0.19:.0f}"
            rx="6" fill="{accent}" opacity=".5"/>
      <circle cx="{w*0.86:.0f}" cy="{bed_y-h*0.01:.0f}" r="{h*0.045:.0f}" fill="#ffd9a0" opacity=".85"/>
    ''')


def write(name, content):
    path = os.path.join(OUT, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('wrote', os.path.relpath(path))


# ---------------------------------------------------------------- hero
W, H = 1600, 900
write('hero.svg', svg(W, H,
    f'''<rect width="{W}" height="{H}" fill="url(#bg)"/>
    <g opacity=".16">{window_wall(W, H*0.95, 9, 4, '#ffffff', '#ffffff', 0.14)}</g>
    <g opacity=".55">
      <rect x="0" y="{H*0.74:.0f}" width="{W}" height="{H*0.26:.0f}" fill="#06302c"/>
      <rect x="{W*0.08:.0f}" y="{H*0.60:.0f}" width="{W*0.26:.0f}" height="{H*0.16:.0f}" rx="18" fill="#0b4f48"/>
      <rect x="{W*0.40:.0f}" y="{H*0.56:.0f}" width="{W*0.22:.0f}" height="{H*0.20:.0f}" rx="18" fill="#0d6158"/>
      <rect x="{W*0.68:.0f}" y="{H*0.63:.0f}" width="{W*0.24:.0f}" height="{H*0.13:.0f}" rx="18" fill="#0b4f48"/>
    </g>
    <circle cx="{W*0.80:.0f}" cy="{H*0.22:.0f}" r="130" fill="#ffd9a0" opacity=".18"/>
    <circle cx="{W*0.80:.0f}" cy="{H*0.22:.0f}" r="70" fill="#ffe7c4" opacity=".22"/>''',
    grad('bg', '#0b3b37', '#115f55')))

# ---------------------------------------------------------------- rooms
rooms = [
    ('room-deluxe.svg',       '#0d7a6f', '#0b4f48', '#8fe3d4', 3),
    ('room-twin.svg',         '#2a6f97', '#1d4e6b', '#a8d8f0', 4),
    ('room-junior.svg',       '#8a6a3b', '#5f4824', '#f0dcae', 3),
    ('room-garden.svg',       '#4a7c42', '#33592d', '#bfe3a8', 2),
    ('room-presidential.svg', '#5c4b8a', '#3e3160', '#d6c8f0', 4),
]
for name, accent, dark, light, cols in rooms:
    write(name, svg(1200, 800, bed_scene(1200, 800, dark, accent, light, cols),
                    grad('bg', '#f7fbfa', light)))

# ---------------------------------------------------------------- dining
write('dining.svg', svg(1200, 800,
    f'''<rect width="1200" height="800" fill="url(#bg)"/>
    <g opacity=".45">{window_wall(1200, 560, 4, 1, '#ffffff', '#ffffff', .35)}</g>
    <rect x="0" y="600" width="1200" height="200" fill="#5f4824" opacity=".25"/>
    <!-- table -->
    <ellipse cx="600" cy="610" rx="400" ry="90" fill="#ffffff" opacity=".92"/>
    <ellipse cx="600" cy="600" rx="400" ry="90" fill="#fdfaf4"/>
    <!-- place settings -->
    <circle cx="420" cy="585" r="46" fill="#ffffff" stroke="#e0d6c2" stroke-width="3"/>
    <circle cx="420" cy="585" r="26" fill="#f3ead8"/>
    <circle cx="600" cy="600" r="52" fill="#ffffff" stroke="#e0d6c2" stroke-width="3"/>
    <circle cx="600" cy="600" r="30" fill="#f3ead8"/>
    <circle cx="780" cy="585" r="46" fill="#ffffff" stroke="#e0d6c2" stroke-width="3"/>
    <circle cx="780" cy="585" r="26" fill="#f3ead8"/>
    <!-- candles -->
    <rect x="585" y="470" width="14" height="70" rx="6" fill="#e8dcc0"/>
    <ellipse cx="592" cy="462" rx="9" ry="16" fill="#ffd9a0"/>
    <rect x="500" y="495" width="11" height="52" rx="5" fill="#e8dcc0"/>
    <ellipse cx="505" cy="488" rx="7" ry="13" fill="#ffd9a0"/>
    <!-- pendant lights -->
    <g opacity=".9">
      <rect x="398" y="0" width="3" height="180" fill="#8a6a3b" opacity=".6"/>
      <path d="M365 180 h70 l-18 48 h-34 z" fill="#b8863b" opacity=".75"/>
      <rect x="598" y="0" width="3" height="140" fill="#8a6a3b" opacity=".6"/>
      <path d="M565 140 h70 l-18 48 h-34 z" fill="#b8863b" opacity=".75"/>
      <rect x="798" y="0" width="3" height="180" fill="#8a6a3b" opacity=".6"/>
      <path d="M765 180 h70 l-18 48 h-34 z" fill="#b8863b" opacity=".75"/>
    </g>''',
    grad('bg', '#fbf7ef', '#e8d9bd')))

# ---------------------------------------------------------------- gallery tiles
tiles = [
    ('g-lobby.svg',    '#0d7a6f', '#8fe3d4', 'lobby'),
    ('g-pool.svg',     '#2a6f97', '#a8d8f0', 'pool'),
    ('g-spa.svg',      '#5c4b8a', '#d6c8f0', 'spa'),
    ('g-terrace.svg',  '#4a7c42', '#bfe3a8', 'terrace'),
    ('g-gym.svg',      '#9a4b4b', '#f0c8c8', 'gym'),
    ('g-suite.svg',    '#8a6a3b', '#f0dcae', 'suite'),
    ('g-bath.svg',     '#3b7c8a', '#aee0ea', 'bath'),
    ('g-street.svg',   '#4b5c8a', '#c8d2f0', 'street'),
]
for name, accent, light, kind in tiles:
    if kind == 'pool':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <rect x="90" y="330" width="720" height="440" rx="26" fill="{accent}" opacity=".55"/>
        <g opacity=".5" stroke="#ffffff" stroke-width="7" fill="none">
          <path d="M120 420 q60 -26 120 0 t120 0 t120 0 t120 0 t120 0"/>
          <path d="M120 520 q60 -26 120 0 t120 0 t120 0 t120 0 t120 0"/>
          <path d="M120 620 q60 -26 120 0 t120 0 t120 0 t120 0 t120 0"/>
        </g>
        <circle cx="720" cy="170" r="78" fill="#ffd9a0" opacity=".55"/>
        <rect x="90" y="250" width="720" height="22" rx="11" fill="#ffffff" opacity=".7"/>'''
    elif kind == 'spa':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <ellipse cx="450" cy="600" rx="300" ry="120" fill="{accent}" opacity=".35"/>
        <circle cx="450" cy="420" r="150" fill="#ffffff" opacity=".55"/>
        <circle cx="450" cy="420" r="92" fill="{light}" opacity=".9"/>
        <g fill="#ffffff" opacity=".8">
          <circle cx="300" cy="700" r="26"/><circle cx="370" cy="730" r="20"/>
          <circle cx="530" cy="730" r="20"/><circle cx="600" cy="700" r="26"/>
        </g>'''
    elif kind == 'gym':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <rect x="150" y="430" width="600" height="34" rx="17" fill="{accent}" opacity=".8"/>
        <rect x="110" y="370" width="90" height="154" rx="24" fill="{accent}"/>
        <rect x="700" y="370" width="90" height="154" rx="24" fill="{accent}"/>
        <rect x="60"  y="410" width="60" height="74" rx="18" fill="{accent}" opacity=".7"/>
        <rect x="780" y="410" width="60" height="74" rx="18" fill="{accent}" opacity=".7"/>
        <rect x="120" y="660" width="660" height="120" rx="18" fill="{light}" opacity=".8"/>'''
    elif kind == 'street':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <g opacity=".75">
          <rect x="60"  y="300" width="180" height="520" rx="12" fill="{accent}" opacity=".7"/>
          <rect x="280" y="180" width="200" height="640" rx="12" fill="{accent}"/>
          <rect x="520" y="360" width="150" height="460" rx="12" fill="{accent}" opacity=".6"/>
          <rect x="710" y="240" width="150" height="580" rx="12" fill="{accent}" opacity=".85"/>
        </g>
        {window_wall(900, 820, 6, 6, '#ffffff', '#ffffff', .22)}
        <circle cx="180" cy="150" r="70" fill="#ffd9a0" opacity=".5"/>'''
    elif kind == 'bath':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <rect x="150" y="470" width="600" height="230" rx="110" fill="#ffffff" opacity=".95"/>
        <rect x="190" y="510" width="520" height="150" rx="80" fill="{light}" opacity=".9"/>
        <rect x="420" y="200" width="18" height="250" rx="9" fill="{accent}" opacity=".8"/>
        <circle cx="429" cy="190" r="48" fill="{accent}" opacity=".8"/>
        <rect x="120" y="740" width="660" height="26" rx="13" fill="{accent}" opacity=".35"/>'''
    elif kind == 'terrace':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <rect x="0" y="620" width="900" height="280" fill="{accent}" opacity=".3"/>
        <circle cx="200" cy="520" r="120" fill="{accent}" opacity=".65"/>
        <circle cx="300" cy="560" r="90" fill="{accent}" opacity=".5"/>
        <circle cx="700" cy="500" r="140" fill="{accent}" opacity=".6"/>
        <rect x="380" y="600" width="160" height="22" rx="11" fill="#ffffff" opacity=".9"/>
        <rect x="400" y="620" width="18" height="90" fill="#ffffff" opacity=".8"/>
        <rect x="502" y="620" width="18" height="90" fill="#ffffff" opacity=".8"/>
        <circle cx="130" cy="170" r="80" fill="#ffd9a0" opacity=".5"/>'''
    elif kind == 'suite':
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        {bed_scene(900, 900, accent, accent, light, 3)}'''
    else:  # lobby
        body = f'''<rect width="900" height="900" fill="url(#bg)"/>
        <g opacity=".45">{window_wall(900, 620, 4, 1, '#ffffff', '#ffffff', .3)}</g>
        <rect x="0" y="690" width="900" height="210" fill="{accent}" opacity=".25"/>
        <rect x="120" y="560" width="300" height="150" rx="24" fill="{accent}" opacity=".75"/>
        <rect x="140" y="520" width="260" height="60" rx="24" fill="{light}" opacity=".9"/>
        <rect x="520" y="600" width="260" height="110" rx="20" fill="{accent}" opacity=".6"/>
        <circle cx="650" cy="430" r="58" fill="#ffd9a0" opacity=".6"/>
        <rect x="644" y="120" width="8" height="260" fill="{accent}" opacity=".5"/>'''
    write(name, svg(900, 900, body, grad('bg', '#f7fbfa', light)))

# ---------------------------------------------------------------- favicon
write('favicon.svg', svg(64, 64,
    '''<rect width="64" height="64" rx="14" fill="url(#bg)"/>
    <text x="32" y="43" text-anchor="middle" font-family="Georgia,serif"
          font-size="32" font-weight="700" fill="#ffffff">A</text>''',
    grad('bg', '#0d7a6f', '#11a08f')))

print('done')
