# JSPictureStudio

Portfolio photographique consacré aux voyages et à la vie sauvage en Afrique du Sud.

## Fonctionnalités

- galerie responsive de 390 photographies ;
- variantes WebP 640, 1280 et 2560 px choisies automatiquement avec `srcset` ;
- filtres par thème, lieu et étape du voyage ;
- aperçu plein écran avec navigation au clavier et au swipe ;
- liens partageables vers chaque photographie ;
- sélection et téléchargement d’une ou plusieurs images en JPG ;
- chargement progressif par lots de 24 images avec placeholders colorés ;
- cache local limité pour accélérer les revisites ;
- interface accessible et compatible mobile ;
- aucune dépendance JavaScript externe ni appel à l’API GitHub au chargement.

## Structure

- `index.html` : accueil et sélection Animaux / Paysages ;
- `roadTrip.html` : Ferme d’autruches, Addo Park, Tsitsikamma et Sur la route ;
- `Krug.html` : Parc Kruger, Reptile Center, Rehab Center et Bourke’s Luck ;
- `gallery.js` : galerie, filtres, lightbox, partage et téléchargements ;
- `photo-manifest.js` : dimensions, catégories, couleurs dominantes et URLs des variantes ;
- `style.css` : système visuel et responsive.
- `sw.js` : cache du shell et des dernières images consultées ;
- `Toolbox/build_images.py` : génération reproductible des variantes et du manifeste ;
- `Toolbox/add-photos.sh` : import, commits et push automatiques sur les deux branches.

## Architecture des images

La branche `main`, utilisée par GitHub Pages, ne contient que les fichiers optimisés :

- `*-640.webp` pour les miniatures ;
- `*-1280.webp` pour les grands écrans et écrans Retina ;
- `*-2560.webp` pour la lightbox.

Les JPG pleine définition sont conservés sur la branche `originals`. Ils ne font donc
plus partie du déploiement GitHub Pages et ne sont récupérés que lorsqu’un visiteur
demande un téléchargement.

## Lancer en local

Les pages peuvent être servies avec n’importe quel serveur statique :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Ajouter des photographies

Installer Pillow une seule fois :

```bash
pip install Pillow
```

Déposer ensuite les JPG dans le dossier `imports` de la collection. Exemples :

```text
imports/Landscape/
imports/Animal/
imports/roadTrip/AddoPark/
imports/Krug/Kruger/
```

Depuis Git Bash, à la racine du dépôt, lancer simplement :

```bash
./Toolbox/add-photos.sh roadTrip/AddoPark
```

Le script :

1. crée automatiquement un worktree local pour `originals` si nécessaire ;
2. copie et publie les JPG pleine définition sur `originals` ;
3. crée les variantes WebP 640, 1280 et 2560 px ;
4. fusionne les nouvelles entrées dans `photo-manifest.js` ;
5. committe et pousse les branches `originals` et `main`.

Collections acceptées :

```text
Animal
Landscape
roadTrip/FermeAutruche
roadTrip/AddoPark
roadTrip/Tsitsikamma
roadTrip/Random
Krug/Kruger
Krug/ReptileCenter
Krug/RehabCenter
Krug/BourkesLuck
```

Un dossier extérieur peut aussi être donné directement :

```bash
./Toolbox/add-photos.sh Landscape /c/Users/katia/Desktop/nouvelles-photos
```

Le fichier `.gitignore` empêche les JPG pleine définition d’être réintroduits
accidentellement dans le site publié.
