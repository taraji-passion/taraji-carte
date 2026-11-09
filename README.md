# Carte Supporter Taraji — démo

Prototype de démo (15 janvier 2027) pour l'Espérance Sportive de Tunis : Carte Supporter, Pass Taraji Voyageur, billets virtuels et mur en direct, Tirelires Famille, Points Bâtisseur, simulateur pour le président et back-office.

Données fictives stockées dans le navigateur (localStorage). Aucun vrai paiement (MyTaraji / Zitouna Payment en V1). Montants en TND.

## Lancer

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # export statique dans out/
npx serve out          # servir l'export
```

## Publier sur GitHub Pages (gratuit)

1. Créer un dépôt public, par exemple `taraji-carte`, et y pousser ce dossier.
2. Settings → Pages → Source : **GitHub Actions**.
3. Le workflow `.github/workflows/deploy-pages.yml` construit l'app avec `NEXT_PUBLIC_BASE_PATH=/<nom-du-dépôt>` et la publie sur `https://<compte>.github.io/<nom-du-dépôt>/`.
