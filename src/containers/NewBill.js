// PARCOURS EMPLOYE EN MAJORITE
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

// Classe NewBill : Cette classe gère la création d'une nouvelle note de frais par un employé
// Parcours employé

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    // Initialisation des propriétés et définition des éléments du DOM
    this.document = document
    this.onNavigate = onNavigate
    this.store = store

    // Sélection du formulaire de nouvelle note de frais
    // Parcours employé
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    // Ajout d'un écouteur d'événement pour soumettre le formulaire
    formNewBill.addEventListener("submit", this.handleSubmit)

    // Sélection de l'input pour le fichier (justificatif de la note de frais)
    // Parcours employé
    const file = this.document.querySelector(`input[data-testid="file"]`)
    // Ajout d'un écouteur d'événement pour changer le fichier
    file.addEventListener("change", this.handleChangeFile)

    // Initialisation des variables liées au fichier
    this.fileUrl = null
    this.fileName = null
    this.billId = null

    // Gestion de la déconnexion de l'utilisateur
    // Parcours employé et administrateur
    new Logout({ document, localStorage, onNavigate })
  }

  // Partie du code pour que l'employé telecharge un justificatif enregistré dans la base de données
  handleChangeFile = e => {
    // Fonction appelée quand un fichier est sélectionné
    // Parcours employé
    e.preventDefault()
    
    // Récupération du fichier sélectionné
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]

    // FIX BUG HUNT 1 sur extention image
     // Vérification de l'extension du fichier pour s'assurer qu'il s'agit bien d'un format image accepté (.jpg, .jpeg, .png)
     const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
     if (!allowedExtensions.exec(file.name)) {
       alert('Veuillez télécharger un fichier au format jpg, jpeg, ou png uniquement.');
       e.target.value = ''; // Réinitialisation de l'input file en cas de format incorrect
       return;
     }

    // Extraction du nom du fichier
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]

    // Création d'un objet FormData pour envoyer le fichier
    const formData = new FormData()
    // Récupération de l'email de l'utilisateur connecté
    const email = JSON.parse(localStorage.getItem("user")).email
    // Ajout du fichier et de l'email dans formData
    formData.append('file', file)
    formData.append('email', email)

    // Création du fichier dans la base de données à l'aide de la méthode store.bills()
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        // Mise à jour des informations sur la note de frais après la création
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      })
      .catch(error => console.error(error))
  }

  // fonction pour envoyer les données du formulaire après avoir validé les infos et navigue vers les pages de factures
  handleSubmit = e => {
    // Fonction appelée lors de la soumission du formulaire de nouvelle note de frais
    // Parcours employé
    e.preventDefault()

    // Récupération des valeurs des différents champs du formulaire
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    
    // Mise à jour de la note de frais dans la base de données
    this.updateBill(bill)

    // Navigation vers la page des factures après soumission
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // Fonction qui met à jour la note de frais
  // Parcours employé - Mise à jour de la base de données avec les informations de la nouvelle note de frais
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({ data: JSON.stringify(bill), selector: this.billId })
      .then(() => {
        // Navigation vers la page des factures après mise à jour
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}
