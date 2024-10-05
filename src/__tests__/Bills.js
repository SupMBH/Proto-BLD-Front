/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bill from "../containers/Bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore);

// Début du bloc de tests : Scénario où l'utilisateur est connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  // Bloc de tests concernant l'accès à la page des notes de frais
  describe("When I am on Bills Page", () => {

    // Parcours Employé - Test si l'icône de la page est surlignée
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Configuration du localStorage pour simuler un utilisateur employé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      // Création de la structure HTML nécessaire au test
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Attente que l'icône soit disponible dans le DOM
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');

      // À faire : écrire l'expression expect pour vérifier que l'icône est surlignée
      // EXPRESSION ECRITE ICI
      // Vérifie que l'icône est surlignée (classe "active-icon" présente)
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();
    });

    // Parcours Employé - Test si les notes de frais sont triées correctement
    test("Then bills should be ordered from earliest to latest", () => {
      // Injecte l'interface utilisateur des notes de frais dans le DOM
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupération de toutes les dates affichées sous forme de texte
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML);

      // DEBUG BUG REPORT 1 : Afficher les dates avant le tri
      console.log("Dates avant le tri : ", dates);

      // Conversion des dates en objets Date pour effectuer la comparaison
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // DEBUG BUG REPORT 1: Afficher les dates après le tri
      console.log("Dates après le tri : ", datesSorted);

      // Comparaison des dates : attendu vs reçu
      expect(dates).toEqual(datesSorted);
    });

    // AJOUT TEST 1 - Parcours Employé : Vérifie la présence des icônes de visualisation pour chaque note de frais
    test("Then each bill should have a view details icon", () => {
      // Injection de l'interface utilisateur des notes de frais dans le DOM
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupération de toutes les icônes de visualisation (œil)
      const viewIcons = screen.getAllByTestId("icon-eye");

      // Vérification que le nombre d'icônes correspond au nombre de factures
      expect(viewIcons.length).toBe(bills.length); // Vérifie que toutes les factures ont une icône

      // Vérifie que chaque icône est bien présente
      viewIcons.forEach(icon => {
        expect(icon).toBeTruthy(); // Vérifie que chaque icône est bien présente
      });
    });
  });

  // Bloc de tests concernant l'affichage des détails de la note de frais
  describe("When I click on the view bill icon", () => {
    test("Then I should see the bill info", async () => {
      // Mock de la méthode modal pour Jest
      $.fn.modal = jest.fn(); // Simulation de la méthode `modal()` de JQuery pour éviter les erreurs pendant les tests

      // Configuration du localStorage pour simuler un utilisateur employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Création de la structure HTML nécessaire au test
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      // Définition de la fonction de navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      window.onNavigate(ROUTES_PATH.Bills);

      // Injection de l'interface utilisateur des notes de frais dans le DOM
      document.body.innerHTML = BillsUI({ data: bills });
      const store = null;
      const bill = new Bill({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      // Attente que toutes les icônes de visualisation soient disponibles dans le DOM
      await waitFor(() => screen.getAllByTestId("icon-eye"));
      const handleClickIconEye = jest.spyOn(bill, "handleClickIconEye");

      // Récupération des icônes de visualisation et simulation du clic
      const viewIcons = screen.getAllByTestId("icon-eye");
      const testedElement = viewIcons[0];

      // Simulation du clic sur l'icône de vue
      userEvent.click(testedElement);

      // Vérifie que la méthode handleClickIconEye a été appelée après le clic
      expect(handleClickIconEye).toHaveBeenCalled();
      // Vérification que la méthode modal a été appelée pour afficher la modale
      expect($.fn.modal).toHaveBeenCalled();
    });
  });
});

// Test d'intégration GET
// Vérifie que les données sont correctement récupérées de l'API mockée
describe("Given I am connected as an employee", () => {
  describe("When I navigate to the bills Page", () => {
    test("Then fetches bills from mock API GET", async () => {
      // Simule un utilisateur connecté en tant qu'employé
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Création de la structure HTML nécessaire pour le test
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Attente que l'élément tbody contenant les notes de frais soit disponible
      await waitFor(() => screen.getByTestId("tbody"));
      const billBody = screen.getByTestId("tbody");
      const bills = billBody.getElementsByTagName("tr");

      // Vérification que le nombre de lignes dans le tableau correspond au nombre de factures attendues
      expect(bills.length).toBe(4);
    });

    // Bloc de tests : Scénarios d'erreurs de l'API
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        // Mock de la méthode `bills` pour simuler des erreurs d'API
        jest.spyOn(mockStore, "bills");

        // Configuration du localStorage pour simuler un utilisateur employé
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        // Création de la structure HTML nécessaire pour le test
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      // Test : Erreur 404 de l'API lors de la récupération des factures
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      // Test : Erreur 500 de l'API lors de la récupération des factures
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});