document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const CONSTANTS = {
    MIN_PARTICIPANTS: 1,
    MAX_PARTICIPANTS: 60,
    MIN_PARTIES: 1,
    MAX_PARTIES: 10,
    ERROR_DISPLAY_DURATION: 5000,
    INFO_DISPLAY_DURATION: 3000,
    STORAGE_KEYS: {
      PARTICIPANTS: 'petanque_participants',
      MATCHES: 'petanque_matches'
    }
  };

  // DOM Elements
  const nombreParticipantsInput = document.querySelector("#nombreParticipants");
  const genererParticipantsButton = document.querySelector("#genererParticipants");
  const exportExcel = document.querySelector("#exportMatchs");
  const listeParticipants = document.querySelector("#listeParticipants");
  const listeMatchs = document.querySelector("#listeMatchs");
  const genererMatchsButton = document.querySelector("#genererMatchs");
  const nombrePartiesInput = document.querySelector("#nombreParties");
  const resetButton = document.querySelector("#resetTournoi");
  const participantsSection = document.querySelector("#participantsSection");
  const matchesSection = document.querySelector("#matchesSection");

  // State
  let matchs = [];
  let listeDesParticipants = [];

  // Event Listeners
  genererParticipantsButton.addEventListener("click", genererParticipants);
  genererMatchsButton.addEventListener("click", handleGenererMatchs);
  exportExcel.addEventListener("click", exportToExcel);
  resetButton.addEventListener("click", resetTournament);

  // Initialize - Load saved data if exists
  chargerDonnees();

  /**
   * Generate participants based on user input
   */
  function genererParticipants() {
    const nombreParticipants = parseInt(nombreParticipantsInput.value, 10);
    const maxParticipants = parseInt(nombreParticipantsInput.max, 10);

    // Validation
    if (isNaN(nombreParticipants)) {
      displayErrorMessage("Veuillez entrer un nombre valide.");
      return;
    }

    if (nombreParticipants < CONSTANTS.MIN_PARTICIPANTS) {
      displayErrorMessage("Le nombre doit être supérieur à 0.");
      return;
    }

    if (nombreParticipants > maxParticipants) {
      displayErrorMessage(`Le nombre maximum de participants est ${maxParticipants}.`);
      return;
    }

    // Clear previous error
    displayErrorMessage("");

    // Show loading state
    setLoadingState(genererParticipantsButton, true);

    // Simulate async operation for smooth UX
    setTimeout(() => {
      listeDesParticipants = genererListeParticipants(nombreParticipants);
      afficherListeParticipants(listeDesParticipants);
      genererMatchsButton.classList.remove("hidden");
      participantsSection.classList.remove("hidden");
      resetButton.classList.remove("hidden");

      // Save to localStorage
      sauvegarderDonnees();

      setLoadingState(genererParticipantsButton, false);

      showToast(`✓ ${nombreParticipants} participants générés avec succès!`, 'success');
    }, 300);
  }

  /**
   * Generate list of participants
   */
  function genererListeParticipants(nombreParticipants) {
    return Array.from({ length: nombreParticipants }, (_, i) => `Joueur ${i + 1}`);
  }

  /**
   * Display participants list in UI
   */
  function afficherListeParticipants(participants) {
    listeParticipants.textContent = "";

    participants.forEach((participant, index) => {
      const li = document.createElement("li");
      li.textContent = participant;
      li.classList.add("participant-item");
      li.style.animationDelay = `${index * 0.03}s`;
      listeParticipants.appendChild(li);
    });
  }

  /**
   * Generate teams from participants
   */
  function genererEquipes(participants) {
    const participantsMelanges = melangerArray([...participants]);
    const equipes = [];

    // Handle odd number by creating teams with remaining players
    for (let i = 0; i < participantsMelanges.length; i += 2) {
      if (i + 1 < participantsMelanges.length) {
        equipes.push([participantsMelanges[i], participantsMelanges[i + 1]]);
      } else {
        // Odd player - notify user
        showToast(`ℹ️ ${participantsMelanges[i]} sera de côté (nombre impair).`, 'info');
      }
    }

    return equipes;
  }

  /**
   * Handle generate matches button click
   */
  function handleGenererMatchs() {
    const nombreParties = parseInt(nombrePartiesInput.value, 10);

    if (isNaN(nombreParties) || nombreParties < CONSTANTS.MIN_PARTIES) {
      displayErrorMessage("Veuillez entrer un nombre valide de parties.");
      return;
    }

    if (nombreParties > CONSTANTS.MAX_PARTIES) {
      displayErrorMessage(`Le nombre maximum de parties est ${CONSTANTS.MAX_PARTIES}.`);
      return;
    }

    // Clear previous error
    displayErrorMessage("");

    // Show loading state
    setLoadingState(genererMatchsButton, true);

    setTimeout(() => {
      listeMatchs.textContent = ""; // Reset match list
      matchesSection.classList.remove("hidden");

      for (let i = 0; i < nombreParties; i++) {
        genererMatchsAleatoires();
        afficherMatchs(i + 1);
      }

      exportExcel.classList.remove("hidden");

      // Save to localStorage
      sauvegarderDonnees();

      setLoadingState(genererMatchsButton, false);

      showToast(`✓ ${nombreParties} partie(s) générée(s) avec succès!`, 'success');

      // Scroll to matches
      matchesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  function melangerArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Generate random matches from teams
   */
  function genererMatchsAleatoires() {
    const equipes = genererEquipes(listeDesParticipants);
    const equipesMelangees = melangerArray([...equipes]);
    matchs = [];

    // Pair teams for matches - no need for duplicate tracking as teams are unique per round
    for (let i = 0; i < equipesMelangees.length - 1; i += 2) {
      const equipe1 = equipesMelangees[i];
      const equipe2 = equipesMelangees[i + 1];

      if (equipe1 && equipe2) {
        matchs.push({
          equipes: [equipe1.join(" & "), equipe2.join(" & ")],
          vainqueur: null,
        });
      }
    }

    // Vérification des joueurs manquants
    const joueursPresents = matchs.flatMap((match) => match.equipes.flatMap((equipe) => equipe.split(" & ")));
    const joueursManquants = listeDesParticipants.filter((joueur) => !joueursPresents.includes(joueur));

    if (joueursManquants.length > 0) {
      showToast(`ℹ️ ${joueursManquants.length} joueur(s) de côté: ${joueursManquants.join(", ")}`, 'info');
    }

    return matchs;
  }

  /**
   * Display matches in UI
   */
  function afficherMatchs(partieNum) {
    const partieTitle = document.createElement("h2");
    partieTitle.textContent = `Partie ${partieNum}`;
    partieTitle.classList.add("partie-title");
    listeMatchs.appendChild(partieTitle);

    const matchesContainer = document.createElement("div");
    matchesContainer.classList.add("matches-grid");

    matchs.forEach((match, index) => {
      const card = document.createElement("li");
      card.className = "card";
      card.style.animationDelay = `${index * 0.05}s`;

      const title = document.createElement("h3");
      title.textContent = `Match ${index + 1}`;
      card.appendChild(title);

      const equipe1 = document.createElement("span");
      equipe1.textContent = match.equipes[0];
      equipe1.classList.add("team");
      card.appendChild(equipe1);

      if (match.equipes[1]) {
        const vs = document.createElement("span");
        vs.textContent = "VS";
        vs.classList.add("versus");
        card.appendChild(vs);

        const equipe2 = document.createElement("span");
        equipe2.textContent = match.equipes[1];
        equipe2.classList.add("team");
        card.appendChild(equipe2);
      }

      matchesContainer.appendChild(card);
    });

    listeMatchs.appendChild(matchesContainer);
  }

  /**
   * Display error message with auto-clear
   */
  function displayErrorMessage(message) {
    const errorMessageDiv = document.querySelector("#error-message");
    errorMessageDiv.textContent = message;

    // Auto-clear after duration
    if (message) {
      setTimeout(() => {
        errorMessageDiv.textContent = "";
      }, CONSTANTS.ERROR_DISPLAY_DURATION);
    }
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, CONSTANTS.INFO_DISPLAY_DURATION);
  }

  /**
   * Set loading state for button
   */
  function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
      button.disabled = true;
      button.classList.add('loading');
      if (btnText) btnText.classList.add('hidden');
      if (btnLoader) btnLoader.classList.remove('hidden');
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      if (btnText) btnText.classList.remove('hidden');
      if (btnLoader) btnLoader.classList.add('hidden');
    }
  }

  /**
   * Export tournament data to Excel
   */
  function exportToExcel() {
    if (matchs.length === 0) {
      displayErrorMessage("Aucun match à exporter. Générez d'abord les matchs.");
      return;
    }

    try {
      setLoadingState(exportExcel, true);

      setTimeout(() => {
        const wb = XLSX.utils.book_new();

        // Export participants
        const participantsData = [["Participants"], ...listeDesParticipants.map(p => [p])];
        const wsParticipants = XLSX.utils.aoa_to_sheet(participantsData);
        wsParticipants["!cols"] = [{ wch: 30 }];
        XLSX.utils.book_append_sheet(wb, wsParticipants, "Participants");

        // Export matches
        const allMatchs = Array.from(document.querySelectorAll("#listeMatchs .card")).map((card) => {
          const teams = card.querySelectorAll("span.team");
          // teams[0] is equipe1, teams[1] is equipe2
          return [
            teams[0] ? teams[0].textContent : "",
            teams[1] ? teams[1].textContent : "",
            "" // Empty column for scores/results
          ];
        });

        const nombreDeParties = parseInt(nombrePartiesInput.value, 10);
        const matchsParPartie = allMatchs.length / nombreDeParties;

        for (let partie = 1; partie <= nombreDeParties; partie++) {
          const matchsData = [
            ["Équipe 1", "Équipe 2", "Score"],
            ...allMatchs.slice((partie - 1) * matchsParPartie, partie * matchsParPartie)
          ];
          const wsMatchs = XLSX.utils.aoa_to_sheet(matchsData);
          wsMatchs["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 15 }];

          XLSX.utils.book_append_sheet(wb, wsMatchs, `Partie ${partie}`);
        }

        const fileName = `Tournoi-${listeDesParticipants.length}-joueurs-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        setLoadingState(exportExcel, false);
        showToast('✓ Export Excel réussi!', 'success');
      }, 500);
    } catch (error) {
      setLoadingState(exportExcel, false);
      displayErrorMessage("Erreur lors de l'export : " + error.message);
    }
  }

  /**
   * Save data to localStorage
   */
  function sauvegarderDonnees() {
    try {
      localStorage.setItem(CONSTANTS.STORAGE_KEYS.PARTICIPANTS, JSON.stringify(listeDesParticipants));
      localStorage.setItem(CONSTANTS.STORAGE_KEYS.MATCHES, JSON.stringify(matchs));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  function chargerDonnees() {
    try {
      const savedParticipants = localStorage.getItem(CONSTANTS.STORAGE_KEYS.PARTICIPANTS);
      const savedMatches = localStorage.getItem(CONSTANTS.STORAGE_KEYS.MATCHES);

      if (savedParticipants) {
        listeDesParticipants = JSON.parse(savedParticipants);
        if (listeDesParticipants.length > 0) {
          nombreParticipantsInput.value = listeDesParticipants.length;
          afficherListeParticipants(listeDesParticipants);
          genererMatchsButton.classList.remove("hidden");
          participantsSection.classList.remove("hidden");
          resetButton.classList.remove("hidden");
          showToast('ℹ️ Données précédentes restaurées', 'info');
        }
      }

      if (savedMatches) {
        matchs = JSON.parse(savedMatches);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  /**
   * Reset tournament - clear all data
   */
  function resetTournament() {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le tournoi ? Toutes les données seront perdues.')) {
      return;
    }

    // Reset state
    listeDesParticipants = [];
    matchs = [];

    // Reset UI
    listeParticipants.textContent = "";
    listeMatchs.textContent = "";
    nombreParticipantsInput.value = "";
    nombrePartiesInput.value = "1";
    displayErrorMessage("");

    // Hide elements
    genererMatchsButton.classList.add("hidden");
    participantsSection.classList.add("hidden");
    matchesSection.classList.add("hidden");
    exportExcel.classList.add("hidden");
    resetButton.classList.add("hidden");

    // Clear storage
    localStorage.removeItem(CONSTANTS.STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(CONSTANTS.STORAGE_KEYS.MATCHES);

    showToast('✓ Tournoi réinitialisé', 'success');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
