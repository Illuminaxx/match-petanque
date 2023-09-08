document.addEventListener("DOMContentLoaded", function () {
  const nombreParticipantsInput = document.getElementById("nombreParticipants");
  const genererParticipantsButton = document.getElementById(
    "genererParticipants"
  );
  const exportExcel = document.getElementById("exportMatchs");
  const listeParticipants = document.getElementById("listeParticipants");
  const listeMatchs = document.getElementById("listeMatchs");
  let matchs = [];
  let listeDesParticipants = [];

  genererParticipantsButton.addEventListener("click", function () {
    const nombreParticipants = parseInt(nombreParticipantsInput.value);

    if (!isNaN(nombreParticipants) && nombreParticipants > 0) {
      // Générer la liste de participants
      listeDesParticipants = genererListeParticipants(nombreParticipants);

      // Réinitialiser les équipes et les paires jouées
      equipes = [];

      // Afficher la liste de participants
      afficherListeParticipants(listeDesParticipants);
    } else {
      alert(
        "Veuillez entrer un nombre valide de participants (supérieur à 0)."
      );
    }
  });

  function genererListeParticipants(nombreParticipants) {
    const participants = [];
    for (let i = 1; i <= nombreParticipants; i++) {
      participants.push(`Joueur ${i}`);
    }
    return participants;
  }

  function afficherListeParticipants(participants) {
    listeParticipants.innerHTML = "";

    // Créer le titre "Participants"
    const title = document.createElement("h2");
    title.textContent = "Participants";

    // Trouver la div avec la classe "columns"
    const columnsDiv = document.querySelector(".columns");

    // Ajouter le titre en tant que premier enfant de la div
    columnsDiv.insertBefore(title, columnsDiv.firstChild);

    participants.forEach((participant) => {
      const li = document.createElement("li");
      li.textContent = participant;
      listeParticipants.appendChild(li);
    });

    const genererMatchsButton = document.getElementById("genererMatchs");
    genererMatchsButton.style.display = "block";
  }

  function genererEquipes() {
    let participantsMelanges = melangerArray([...listeDesParticipants]);
    equipes = []; // Réinitialisez les équipes

    for (let i = 0; i < participantsMelanges.length; i += 2) {
      let joueur1 = participantsMelanges[i];
      let joueur2 = participantsMelanges[i + 1];
      equipes.push([joueur1 + " & " + joueur2]);
    }

    return equipes;
  }

  // Vous pouvez ajouter une fonction pour générer des matchs aléatoires, sauvegarder les scores, etc.
  const btnGenererMatchs = document.getElementById("genererMatchs");

  btnGenererMatchs.addEventListener("click", function () {
    genererMatchsAleatoires();
    afficherMatchs();
  });

  function melangerArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // échange les éléments
    }
    return array;
  }

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
        matchs.push({
          equipes: [equipesMelanges[i]],
          vainqueur: null,
        });
      }
    }

    return matchs;
  }

  function afficherMatchs() {
    listeMatchs.innerHTML = "";

    // Créer le titre "Liste des matchs"
    const title = document.createElement("h2");
    title.textContent = "Liste des matchs";

    // Trouver la div avec la classe "columns"
    const matchesDiv = document.querySelector(".matches");

    // Ajouter le titre en tant que premier enfant de la div
    matchesDiv.insertBefore(title, matchesDiv.firstChild);

    matchs.forEach((match, index) => {
      // Création de la card
      let card = document.createElement("div");
      card.className = "card";

      // Titre du match
      let title = document.createElement("h3");
      title.textContent = "Match " + (index + 1);
      card.appendChild(title);

      // Équipe 1
      let equipe1 = document.createElement("span");
      equipe1.textContent = match.equipes[0];
      card.appendChild(equipe1);

      if (match.equipes[1]) {
        let vs = document.createElement("span");
        vs.textContent = " vs ";
        card.appendChild(vs);

        // Équipe 2
        let equipe2 = document.createElement("span");
        equipe2.textContent = match.equipes[1];
        card.appendChild(equipe2);
      }

      // Ajout de la card à la liste des matchs
      listeMatchs.appendChild(card);
    });
  }

  // function exportToExcel() {
  //   // Créer un nouveau workbook
  //   const wb = XLSX.utils.book_new();

  //   // Convertir les participants en un tableau 2D pour Excel
  //   const participantsData = Array.from(
  //     document.querySelectorAll("#listeParticipants li")
  //   ).map((li) => [li.textContent]);

  //   // Convertir les matchs en un tableau 2D pour Excel
  //   const matchsData = Array.from(
  //     document.querySelectorAll("#listeMatchs .card")
  //   ).map((card) => {
  //     const teams = card.querySelectorAll("span");
  //     return [
  //       teams[0].textContent,
  //       teams.length > 1 ? teams[1].textContent : "",
  //       teams[2].textContent,
  //     ];
  //   });

  //   // Ajouter les données au workbook
  //   XLSX.utils.book_append_sheet(
  //     wb,
  //     XLSX.utils.aoa_to_sheet(participantsData),
  //     "Participants"
  //   );
  //   XLSX.utils.book_append_sheet(
  //     wb,
  //     XLSX.utils.aoa_to_sheet(matchsData),
  //     "Matchs"
  //   );

  //   // Écrire le workbook dans un fichier
  //   XLSX.writeFile(wb, "tournoi.xlsx");
  // }

  function exportToExcel() {
    // Créer un nouveau workbook
    const wb = XLSX.utils.book_new();

    // Convertir les participants en un tableau 2D pour Excel
    const participantsData = Array.from(
      document.querySelectorAll("#listeParticipants li")
    ).map((li) => [li.textContent]);

    // Convertir les matchs en un tableau 2D pour Excel
    const matchsData = Array.from(
      document.querySelectorAll("#listeMatchs .card")
    ).map((card) => {
      const teams = card.querySelectorAll("span");
      return [
        teams[0].textContent,
        teams.length > 1 ? teams[1].textContent : "",
        teams[2].textContent,
      ];
    });

    // Créer des feuilles à partir des données
    const wsParticipants = XLSX.utils.aoa_to_sheet(participantsData);
    const wsMatchs = XLSX.utils.aoa_to_sheet(matchsData);

    // Définir la largeur des colonnes pour les participants et les matchs
    wsParticipants["!cols"] = [{ wch: 30 }];
    wsMatchs["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 30 }];

    // Style de bordure
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Appliquer le style de bordure et mettre en gras les titres des colonnes
    for (let col of ["A", "B", "C"]) {
      if (wsMatchs[col + "1"]) {
        wsMatchs[col + "1"].s = { border: borderStyle, font: { bold: true } };
      }
    }

    // Appliquer le style de bordure aux cellules des matchs
    for (let i = 2; i <= matchsData.length + 1; i++) {
      for (let col of ["A", "B", "C"]) {
        if (wsMatchs[col + i]) {
          wsMatchs[col + i].s = { border: borderStyle };
        }
      }
    }

    // Ajouter les feuilles au workbook
    XLSX.utils.book_append_sheet(wb, wsParticipants, "Participants");
    XLSX.utils.book_append_sheet(wb, wsMatchs, "Matchs");

    // Écrire le workbook dans un fichier
    XLSX.writeFile(wb, "tournoi.xlsx");
  }

  exportExcel.addEventListener("click", () => {
    exportToExcel();
  });
});
