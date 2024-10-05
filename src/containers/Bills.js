import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

// Classe Bills : Gère la visualisation des notes de frais pour l'administrateur RH
// Parcours Administrateur

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store

    // Sélection du bouton "Nouvelle Note de Frais"
    // Parcours Administrateur : Permet de créer une nouvelle note de frais si nécessaire
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)

    // Sélection des icônes "œil" pour prévisualiser les justificatifs des notes de frais
    // Parcours Administrateur : Permet de voir les justificatifs des employés
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })

    // Gestion de la déconnexion de l'utilisateur
    // Parcours Employé et Administrateur : Déconnexion de l'application
    new Logout({ document, localStorage, onNavigate })
  }

  // Fonction appelée lorsque l'administrateur clique sur "Nouvelle Note de Frais"
  // Parcours Administrateur : Redirige vers la page de création d'une nouvelle note de frais
  handleClickNewBill = () => {    
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  // Fonction appelée lorsqu'un administrateur clique sur une icône "œil"
  // Parcours Administrateur : Affiche la pièce justificative dans une modale
  handleClickIconEye = (icon) => {    
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)

    // Insertion de l'image dans la modale et affichage de celle-ci
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  // Fonction qui récupère les notes de frais pour les afficher
  // Parcours Administrateur : Récupère et formate les données des notes de frais des employés
  getBills = () => {    
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              // Formatage des données de chaque note de frais (date, statut)
              return {
                ...doc,
                date: formatDate(doc.date), // Formatage de la date pour une meilleure lisibilité
                status: formatStatus(doc.status) // Formatage du statut de la note de frais
              }
            } catch(e) {
              // Gestion des erreurs de formatage des données corrompues
              console.log(e, 'for', doc)
              return {
                ...doc,
                date: doc.date, // En cas d'erreur, la date est laissée telle quelle
                status: formatStatus(doc.status) // Le statut est toujours formaté
              }
            }
          })

        // Affiche le nombre total de notes de frais (pour déboguer)
        console.log('length', bills.length)
        return bills
      })
    }
  }
}

