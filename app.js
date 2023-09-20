document.addEventListener("DOMContentLoaded", function () {
  const nombreParticipantsInput = document.querySelector("#nombreParticipants");
  const genererParticipantsButton = document.querySelector(
    "#genererParticipants"
  );
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

      equipes = [];

      afficherListeParticipants(listeDesParticipants);
    } else {
      displayErrorMessage(
        "Veuillez entrer un nombre valide de participants (supérieur à 0)."
      );
    }
  }

  function genererListeParticipants(nombreParticipants) {
    const participants = [];
    for (let i = 1; i <= nombreParticipants; i++) {
      participants.push(`Joueur ${i}`);
    }
    return participants;
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

    genererMatchsButton.style.display = "block";
  }

  function genererEquipes(listeDesParticipants) {
    let participantsMelanges = melangerArray([...listeDesParticipants]);
    equipes = [];

    for (let i = 0; i < participantsMelanges.length; i += 2) {
      let joueur1 = participantsMelanges[i];
      let joueur2 = participantsMelanges[i + 1];
      equipes.push([joueur1 + " & " + joueur2]);
    }

    return equipes;
  }

  genererMatchsButton.addEventListener("click", function () {
    const nombreParties = parseInt(nombrePartiesInput.value);
    listeMatchs.textContent = "";

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
    let equipes = genererEquipes();
    let equipesMelanges = melangerArray([...equipes]);
    matchs = [];

    let joueursAssocies = {};

    for (let i = 0; i < equipesMelanges.length; i += 2) {
      let equipe1 = equipesMelanges[i];
      let equipe2 = equipesMelanges[i + 1];

      if (equipe2 && !equipe1.some((player) => equipe2.includes(player))) {
        if (equipe1.length === 3) {
          let key = [...equipe1].sort().join(",");
          if (joueursAssocies[key]) {
            return genererMatchsAleatoires();
          }
          joueursAssocies[key] = true;
        }

        matchs.push({
          equipes: [equipe1.join(" & "), equipe2.join(" & ")],
          vainqueur: null,
        });
      }
    }

    let joueursPresents = [];
    matchs.forEach((match) => {
      let joueurs = match.equipes.flatMap((equipe) => equipe.split(" & "));
      joueursPresents.push(...joueurs);
    });

    let joueursManquants = listeDesParticipants.filter(
      (joueur) => !joueursPresents.includes(joueur)
    );

    while (joueursManquants.length > 0) {
      let joueurA = joueursManquants.pop();
      let joueurB = joueursManquants.pop();

      for (let match of matchs) {
        if (match.equipes[0].split(" & ").length === 2) {
          match.equipes[0] += " & " + joueurA;
          match.equipes[1] += " & " + joueurB;
          break;
        }
      }
    }

    return matchs;
  }

  function afficherMatchs(partieNum) {
    const partieTitle = document.createElement("h2");
    partieTitle.textContent = "Partie " + partieNum;
    listeMatchs.appendChild(partieTitle);

    console.log("Affichage des matchs:", matchs);

    matchs.forEach((match, index) => {
      console.log("match:", match);
      let card = document.createElement("li");
      card.className = "card";

      let title = document.createElement("h3");
      title.textContent = "Match " + (index + 1);
      card.appendChild(title);

      let equipe1 = document.createElement("span");
      equipe1.textContent = match.equipes[0];
      card.appendChild(equipe1);

      if (match.equipes[1]) {
        let vs = document.createElement("span");
        vs.textContent = " vs ";
        vs.classList.add("versus");
        card.appendChild(vs);

        let equipe2 = document.createElement("span");
        equipe2.textContent = match.equipes[1];
        card.appendChild(equipe2);
      }

      listeMatchs.appendChild(card);
    });
  }

  function exportToExcel() {
    const wb = XLSX.utils.book_new();

    const participantsData = Array.from(
      document.querySelectorAll("#listeParticipants li")
    ).map((li) => [li.textContent]);

    const wsParticipants = XLSX.utils.aoa_to_sheet(participantsData);
    wsParticipants["!cols"] = [{ wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsParticipants, "Participants");

    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    const allMatchs = Array.from(
      document.querySelectorAll("#listeMatchs .card")
    ).map((card) => {
      const teams = card.querySelectorAll("span");
      return [
        teams[0].textContent,
        teams.length > 1 ? teams[1].textContent : "",
        teams[2] ? teams[2].textContent : "",
      ];
    });

    let nombreDeParties = parseInt(
      document.querySelector("#nombreParties").value
    );
    let matchsParPartie = allMatchs.length / nombreDeParties;

    for (let partie = 1; partie <= nombreDeParties; partie++) {
      const matchsData = allMatchs.slice(
        (partie - 1) * matchsParPartie,
        partie * matchsParPartie
      );
      const wsMatchs = XLSX.utils.aoa_to_sheet(matchsData);
      wsMatchs["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 30 }];

      for (let col of ["A", "B", "C"]) {
        if (wsMatchs[col + "1"]) {
          wsMatchs[col + "1"].s = {
            border: borderStyle,
            font: { bold: true },
          };
        }
      }

      for (let i = 2; i <= matchsData.length + 1; i++) {
        for (let col of ["A", "B", "C"]) {
          if (wsMatchs[col + i]) {
            wsMatchs[col + i].s = { border: borderStyle };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, wsMatchs, "Partie " + partie);
    }

    const fileName = "Tournoi-" + listeDesParticipants.length + " joueurs.xlsx";
    XLSX.writeFile(wb, fileName);
  }

  exportExcel.addEventListener("click", () => {
    exportToExcel();
  });
});
