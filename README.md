# JSPictureStudio

Portfolio photographique consacré aux voyages et à la vie sauvage en Afrique du Sud.

## Fonctionnalités

- galerie responsive de 390 photographies WebP ;
- filtres par thème, lieu et étape du voyage ;
- aperçu plein écran avec navigation au clavier et au swipe ;
- liens partageables vers chaque photographie ;
- sélection et téléchargement d’une ou plusieurs images en JPG ;
- chargement progressif par lots de 24 images ;
- interface accessible et compatible mobile ;
- aucune dépendance JavaScript externe ni appel à l’API GitHub au chargement.

## Structure

- `index.html` : accueil et sélection Animaux / Paysages ;
- `roadTrip.html` : Ferme d’autruches, Addo Park, Tsitsikamma et Sur la route ;
- `Krug.html` : Parc Kruger, Reptile Center, Rehab Center et Bourke’s Luck ;
- `gallery.js` : galerie, filtres, lightbox, partage et téléchargements ;
- `photo-manifest.js` : index local léger des fichiers WebP ;
- `style.css` : système visuel et responsive.

## Lancer en local

Les pages peuvent être servies avec n’importe quel serveur statique :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Ajouter des photographies

Ajouter la version WebP dans le dossier de collection et la version JPG téléchargeable dans son sous-dossier `en_jpg`, puis régénérer `photo-manifest.js` à partir des chemins WebP.
