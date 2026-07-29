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
- `Toolbox/build_images.py` : génération reproductible des variantes et du manifeste.

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

## Régénérer les photographies

Le générateur utilise Pillow :

```bash
pip install Pillow
python Toolbox/build_images.py
```

Pour ajouter des photos :

1. travailler depuis la branche `originals` ou un dossier source contenant les JPG ;
2. placer chaque JPG dans le sous-dossier `en_jpg` de sa collection ;
3. ajouter un WebP source du même nom pour déclarer la photo ;
4. exécuter `python Toolbox/build_images.py` ;
5. publier les originaux sur `originals` et les variantes générées sur `main`.

Le fichier `.gitignore` empêche les JPG pleine définition d’être réintroduits
accidentellement dans le site publié.
