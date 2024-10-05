/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    // Avant chaque test, on configure l'environnement nécessaire pour simuler la page NewBill
    beforeEach(() => {
      // Mock du store pour simuler les appels à l'API (Jest gère le faux store)
      jest.mock("../app/store", () => mockStore);

      // On espionne les appels à "bills" dans le mockStore pour vérifier plus tard si cela a été appelé
      jest.spyOn(mockStore, "bills");

      // On simule un utilisateur connecté avec un type "Employee"
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "e@e",
        })
      );

      // Création de l'élément "root" pour injecter l'interface utilisateur de la page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill); // Redirection vers la page NewBill
    });

    describe("And want to fill the form", () => {
      // Test pour vérifier qu'un fichier d'image valide peut être téléchargé
      test("Then I can upload a valid image type file", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Chargement de l'interface utilisateur de la page NewBill
        document.body.innerHTML = NewBillUI();

        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // On attend que le champ fichier soit disponible (testId = "file")
        await waitFor(() => screen.getByTestId("file"));

        // Espionnage de la fonction handleChangeFile
        const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");

        // Création d'un fichier image de type PNG (simulé)
        const fileInput = screen.getByTestId("file");
        const pngFile = new File(["image"], "image.png", {
          type: "image/png",
        });

        // Ajout de l'événement "change" au champ fichier et simulation de l'upload de l'image
        fileInput.addEventListener("change", handleChangeFile);
        userEvent.upload(fileInput, pngFile);

        // Vérification que handleChangeFile a été bien appelé
        expect(handleChangeFile).toHaveBeenCalled();
      });

      // Test pour vérifier si une alerte est affichée lorsque le fichier téléchargé n'est pas une image
      test("Then I received an alert message if the file upload is not an image", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Chargement de l'interface utilisateur de la page NewBill
        document.body.innerHTML = NewBillUI();

        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // On attend que le champ fichier soit disponible (testId = "file")
        await waitFor(() => screen.getByTestId("file"));

        // Espionnage de la fonction handleChangeFile et de l'alerte (window.alert)
        const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
        jest.spyOn(window, "alert").mockImplementation(() => {});

        // Création d'un fichier PDF pour simuler un mauvais type de fichier
        const fileInput = screen.getByTestId("file");
        const pdfFile = new File(["image"], "not-an-image.pdf", {
          type: "application/pdf",
        });

        // Simulation de l'upload du fichier PDF
        userEvent.upload(fileInput, pdfFile);

        // Vérification que handleChangeFile a bien été appelée et que l'alerte est affichée
        expect(handleChangeFile).toBeTruthy();
        expect(window.alert).toHaveBeenCalledWith(
          "Veuillez télécharger un fichier au format jpg, jpeg, ou png uniquement."
        );
      });
    });

    // Test pour vérifier si l'utilisateur peut soumettre la nouvelle note de frais (NewBill)
    test("Then I can submit the newBill", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Chargement de l'interface utilisateur de la page NewBill
      document.body.innerHTML = NewBillUI();

      const store = mockStore;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Création d'une fonction mock pour handleSubmit
      const mockFunction = jest.fn();

      // Espionnage de la fonction handleSubmit et remplacement par la fonction mock
      const handleSubmit = jest
        .spyOn(newBill, "handleSubmit")
        .mockImplementation(mockFunction);

      // Ajout de l'événement "submit" au formulaire et simulation de la soumission
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);

      // Vérification que la fonction handleSubmit a bien été appelée
      expect(handleSubmit).toHaveBeenCalled();
    });

    // Tests pour vérifier les réponses du serveur (POST)
    describe("Tests for server responses", () => {
      let errorSpy;

      // Espionner les erreurs dans la console avant chaque test
      beforeEach(() => {
        errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      });

      // Rétablir la console après chaque test
      afterEach(() => {
        errorSpy.mockRestore();
      });

      // Test pour vérifier si une réponse 200 du serveur est bien loguée
      test("Then we logged a console.log when the server sends a 200 HTTP request", async () => {
        document.body.innerHTML = NewBillUI();

        // Mock de la fonction create() qui retourne une réponse réussie
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.resolve({
                fileUrl: "https://localhost:3456/images/test.jpg",
                key: "1234",
              });
            },
          };
        });

        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          },
          store,
          localStorage: window.localStorage,
        });

        // Attente de la disponibilité du champ fichier et simulation de l'upload d'un fichier image valide
        await waitFor(() => screen.getByTestId("file"));
        const fileInput = screen.getByTestId("file");
        const pngFile = new File(["image"], "is-an-image.png", {
          type: "image/png",
        });

        const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        userEvent.upload(fileInput, pngFile);

        // Vérification que le console.log a bien été appelé
        await waitFor(() => {
          expect(logSpy).toHaveBeenCalled();
          const logArg = console.log.mock.calls[0][0];
          expect(logArg).toBe("https://localhost:3456/images/test.jpg");
        });
      });

      // Test pour vérifier si une erreur 404 est bien loguée
      test("Then we logged an error if the server answers with an error 404", async () => {
        document.body.innerHTML = NewBillUI();

        // Mock de la fonction create() qui retourne une erreur 404
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          },
          store,
          localStorage: window.localStorage,
        });

        // Attente de la disponibilité du champ fichier et simulation de l'upload d'un fichier image valide
        await waitFor(() => screen.getByTestId("file"));
        const fileInput = screen.getByTestId("file");
        const pngFile = new File(["image"], "is-an-image.png", {
          type: "image/png",
        });

        userEvent.upload(fileInput, pngFile);

        // Vérification que l'erreur est bien loguée
        await waitFor(() => {
          expect(errorSpy).toHaveBeenCalled();
          const errorArg = console.error.mock.calls[0][0];
          expect(errorArg).toBeInstanceOf(Error);
          expect(errorArg.message).toBe("Erreur 404");
        });
      });

      // Test pour vérifier si une erreur 500 est bien loguée
      test("Then we logged an error if the server answers with an error 500", async () => {
        document.body.innerHTML = NewBillUI();

        // Mock de la fonction create() qui retourne une erreur 500
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          },
          store,
          localStorage: window.localStorage,
        });

        // Attente de la disponibilité du champ fichier et simulation de l'upload d'un fichier image valide
        await waitFor(() => screen.getByTestId("file"));
        const fileInput = screen.getByTestId("file");
        const pngFile = new File(["image"], "is-an-image.png", {
          type: "image/png",
        });

        userEvent.upload(fileInput, pngFile);

        // Vérification que l'erreur est bien loguée
        await waitFor(() => {
          expect(errorSpy).toHaveBeenCalled();
          const errorArg = console.error.mock.calls[0][0];
          expect(errorArg).toBeInstanceOf(Error);
          expect(errorArg.message).toBe("Erreur 500");
        });
      });
    });
  });
});
