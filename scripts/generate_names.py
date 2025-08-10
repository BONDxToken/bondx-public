# Writes BONDx/sim_names.json and BONDx/sim_names.csv deterministically (seed=42)
import json, random, csv
from pathlib import Path

random.seed(42)

adjectives = ["Galloping","Cheeky","Midnight","Turbo","Dusty","Bouncy","Lucky","Wobbly","Spicy","Grumpy","Zippy","Chunky","Noble","Whistling","Sneaky","Cosmic","Rusty","Electric","Sassy","Snorting","Pebbled","Minty","Shiny","Muddy","Saucy","Curly","Fuzzy","Pixel","Giggling","Plucky","Breezy","Cranky","Dashing","Hyper","Icy","Jelly","Loopy","Nifty","Quirky","Rowdy","Sunny","Tango","Velvet","Whimsy","Zesty","Brisk","Crispy","Dizzy","Eager","Flashy"]
colors = ["Bay","Chestnut","Roan","Dun","Pinto","Palomino","Black","Grey","Sorrel","Ivory","Mahogany","Pearl","Cocoa","Caramel","Amber","Onyx","Silver","Gold","Sable","Slate"]
nouns = ["Hoof","Mane","Whinny","Canter","Trot","Neigh","Saddle","Stirrup","Bridle","Horseshoe","Jockey","Derby","Pasture","Haystack","Stable","Paddock","Colt","Filly","Mustang","Clydesdale","Bronco","Pony","Gallop","Thoroughbred","Foal","Ranch","Trail","Lasso","Rodeo","Corral"]
puns = ["Neigh-sayer","Giddy-Up","HoofHearted","ManeEvent","Sir Neighs-a-lot","Unbridled Joy","Stable Genius","Udderly Fast","Bit Coin","Alt-steed","Furlong Shot","Hay There","Mustang Sally","Horse Power","Trot Rocket","Foal Play","Mane Character","Pasture Prime","Stall-ionaire","Neigh-borhood Hero","Hay Day","Derbyshire Lad","Hay Fever","Clip Clop","Reins Supreme","Whinny the Pooh","Saddle Light","Bridle Joy","Loco-Motive","Neighflix"]
suffixes = ["MK1","MK2","of Buckingham","of Milton Keynes","of Luton","the Third","Jr","Sr","Ltd","LLP","DAO","v2","v3","X","XL","Max","Plus","Ultra","Prime"]

def titlecase(s): return " ".join(w[:1].upper()+w[1:] for w in s.split())

base = set()
for a in adjectives:
    for c in colors:
        base.add(f"{a} {c} {random.choice(nouns)}")
        base.add(f"{a} {c} {random.choice(nouns)}")
        base.add(f"{a} {c}")
for p in puns: base.add(p)
base = list(base)
random.shuffle(base)

target = 100_000
out, seen = [], set()
i = 0
while len(out) < target:
    b = base[i % len(base)]
    r = random.random()
    if r < 0.3:
        cand = f"{b} {random.choice(suffixes)}"
    elif r < 0.6:
        cand = f"{b} #{random.randint(2,9999)}"
    elif r < 0.8:
        cand = f"{random.choice(puns)} {random.choice(suffixes)}"
    else:
        cand = b
    cand = titlecase(cand)
    if cand in seen:
        k = 2
        nn = f"{cand} •{k}"
        while nn in seen:
            k += 1
            nn = f"{cand} •{k}"
        cand = nn
    out.append(cand); seen.add(cand); i += 1

root = Path("BONDx")
root.mkdir(parents=True, exist_ok=True)
(root / "sim_names.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
with open(root / "sim_names.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f); w.writerow(["name"]); w.writerows([[n] for n in out])

print("Wrote BONDx/sim_names.json and BONDx/sim_names.csv")
