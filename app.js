document.addEventListener("DOMContentLoaded", function () {
  const nombreParticipantsInput = document.querySelector("#nombreParticipants");
  const genererParticipantsButton = document.querySelector("#genererParticipants");
  const exportExcel = document.querySelector("#exportMatchs");
  const listeParticipants = document.querySelector("#listeParticipants");
  const listeMatchs = document.querySelector("#listeMatchs");
  const genererMatchsButton = document.querySelector("#genererMatchs");
  const nombrePartiesInput = document.querySelector("#nombreParties");

  let matchs = [];
  let listeDesParticipants = [];

  genererParticipantsButton.addEventListener("click", genererParticipants);

  function genererParticipants() {
    const nombreParticipants = parseInt(nombreParticipantsInput.value, 10);

    if (!isNaN(nombreParticipants) && nombreParticipants > 0) {
      listeDesParticipants = genererListeParticipants(nombreParticipants);
      afficherListeParticipants(listeDesParticipants);
      genererMatchsButton.style.display = "block"; // Afficher le bouton pour générer les matchs
    } else {
      displayErrorMessage("Veuillez entrer un nombre valide de participants (supérieur à 0).");
    }
  }

  function genererListeParticipants(nombreParticipants) {
    return Array.from({ length: nombreParticipants }, (_, i) => `Joueur ${i + 1}`);
  }

  function afficherListeParticipants(participants) {
    listeParticipants.textContent = "";

    const existingTitle = document.querySelector(".columns h2");
    if (!existingTitle) {
      const title = document.createElement("h2");
      title.textContent = "Participants";
      const columnsDiv = document.querySelector(".columns");
      columnsDiv.insertBefore(title, columnsDiv.firstChild);
    }

    participants.forEach((participant) => {
      const li = document.createElement("li");
      li.textContent = participant;
      listeParticipants.appendChild(li);
    });
  }

  function genererEquipes(participants) {
    const participantsMelanges = melangerArray([...participants]);

    if (participantsMelanges.length % 2 !== 0) {
      displayErrorMessage("Nombre impair de participants. Un joueur sera mis de côté.");
    }

    const equipes = [];
    for (let i = 0; i < participantsMelanges.length - 1; i += 2) {
      const joueur1 = participantsMelanges[i];
      const joueur2 = participantsMelanges[i + 1];
      equipes.push([joueur1, joueur2]);
    }

    return equipes;
  }

  genererMatchsButton.addEventListener("click", function () {
    const nombreParties = parseInt(nombrePartiesInput.value, 10);

    if (isNaN(nombreParties) || nombreParties <= 0) {
      displayErrorMessage("Veuillez entrer un nombre valide de parties.");
      return;
    }

    listeMatchs.textContent = ""; // Réinitialiser la liste des matchs

    for (let i = 0; i < nombreParties; i++) {
      genererMatchsAleatoires();
      afficherMatchs(i + 1);
    }

    exportExcel.disabled = false;
  });

  function melangerArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function genererMatchsAleatoires() {
    const equipes = genererEquipes(listeDesParticipants);
    const equipesMelangees = melangerArray([...equipes]);
    matchs = [];

    const joueursAssocies = {};

    for (let i = 0; i < equipesMelangees.length - 1; i += 2) {
      const equipe1 = equipesMelangees[i];
      const equipe2 = equipesMelangees[i + 1];

      const key = [...equipe1].sort().join(",");
      if (joueursAssocies[key]) continue;

      matchs.push({
        equipes: [equipe1.join(" & "), equipe2.join(" & ")],
        vainqueur: null,
      });

      joueursAssocies[key] = true;
    }

    // Vérification des joueurs manquants
    const joueursPresents = matchs.flatMap((match) => match.equipes.flatMap((equipe) => equipe.split(" & ")));
    const joueursManquants = listeDesParticipants.filter((joueur) => !joueursPresents.includes(joueur));

    if (joueursManquants.length > 0) {
      afficherMessageInfo("Certains joueurs n'ont pas été assignés à des matchs.");
    }

    return matchs;
  }

  

  function afficherMatchs(partieNum) {
    const partieTitle = document.createElement("h2");
    partieTitle.textContent = "Partie " + partieNum;
    listeMatchs.appendChild(partieTitle);

    matchs.forEach((match, index) => {
      const card = document.createElement("li");
      card.className = "card";

      const title = document.createElement("h3");
      title.textContent = "Match " + (index + 1);
      card.appendChild(title);

      const equipe1 = document.createElement("span");
      equipe1.textContent = match.equipes[0];
      card.appendChild(equipe1);

      if (match.equipes[1]) {
        const vs = document.createElement("span");
        vs.textContent = " vs ";
        vs.classList.add("versus");
        card.appendChild(vs);

        const equipe2 = document.createElement("span");
        equipe2.textContent = match.equipes[1];
        card.appendChild(equipe2);
      }

      listeMatchs.appendChild(card);
    });
  }

  function displayErrorMessage(message) {
    const errorMessageDiv = document.querySelector("#error-message");
    errorMessageDiv.textContent = message;
  }


  function afficherMessageInfo(message) {
    console.log(message); // Peut être remplacé par une vraie notification dans l'UI
  }

  function exportToExcel() {
    const wb = XLSX.utils.book_new();

    const participantsData = Array.from(document.querySelectorAll("#listeParticipants li")).map((li) => [li.textContent]);

    const wsParticipants = XLSX.utils.aoa_to_sheet(participantsData);
    wsParticipants["!cols"] = [{ wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsParticipants, "Participants");

    const allMatchs = Array.from(document.querySelectorAll("#listeMatchs .card")).map((card) => {
      const teams = card.querySelectorAll("span");
      return [teams[0].textContent, teams.length > 1 ? teams[1].textContent : "", teams[2] ? teams[2].textContent : ""];
    });

    const nombreDeParties = parseInt(nombrePartiesInput.value, 10);
    const matchsParPartie = allMatchs.length / nombreDeParties;

    for (let partie = 1; partie <= nombreDeParties; partie++) {
      const matchsData = allMatchs.slice((partie - 1) * matchsParPartie, partie * matchsParPartie);
      const wsMatchs = XLSX.utils.aoa_to_sheet(matchsData);
      wsMatchs["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 30 }];

      XLSX.utils.book_append_sheet(wb, wsMatchs, "Partie " + partie);
    }

    const fileName = "Tournoi-" + listeDesParticipants.length + " joueurs.xlsx";
    XLSX.writeFile(wb, fileName);
  }

  exportExcel.addEventListener("click", exportToExcel);
});
