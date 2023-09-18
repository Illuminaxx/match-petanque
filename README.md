# Pétanque Tournament

This is a web app that allows users to generate a list of participants for a pétanque tournament, and then generate a list of matches. The app also allows users to export the list of matches to an Excel file.

## How to use the app

To use the app, follow these steps:

1. Enter the number of participants in the tournament.
2. Click the "Generate Participants" button.
3. The app will generate a list of participants.
4. Click the "Generate Matches" button.
5. The app will generate a list of matches.
6. Click the "Export to Excel" button to export the list of matches to an Excel file.

## Code explanation

The app is built using HTML, CSS, and JavaScript. The HTML code defines the structure of the app, the CSS code defines the styling of the app, and the JavaScript code defines the functionality of the app.

The JavaScript code is divided into three parts:

1. The first part of the code defines the variables that will be used in the app.
2. The second part of the code defines the functions that will be used in the app.
3. The third part of the code calls the functions that will generate the list of participants and the list of matches.

The following code snippet shows how to generate the list of participants:

```javascript
function genererListeParticipants(nombreParticipants) {
  const participants = [];
  for (let i = 1; i <= nombreParticipants; i++) {
    participants.push(`Joueur ${i}`);
  }
  return participants;
}
```

The following code snippet shows how to generate the list of matches:

```javascript
function genererMatchsAleatoires() {
  genererEquipes();
  let equipesMelanges = melangerArray([...equipes]);

  // Réinitialisez les matchs

  for (let i = 0; i < equipesMelanges.length; i += 2) {
    if (equipesMelanges[i + 1]) {
      matchs.push({
        equipes: [equipesMelanges[i], equipesMelanges[i + 1]],
        vainqueur: null, // Initialisez les scores à 0
      });
    } else {
      // Si le nombre de participants est impair, le dernier n'a pas de match

```
