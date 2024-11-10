// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB7zZtaWXNXFbyhmf9e8MYK7WysLP1EMFI",
    authDomain: "beshalom-fe255.firebaseapp.com",
    projectId: "beshalom-fe255",
    storageBucket: "beshalom-fe255.firebasestorage.app",
    messagingSenderId: "174521365580",
    appId: "1:174521365580:web:a3b98a06f894ff8f3bf0e9",
    measurementId: "G-KHKN0RDBV3"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); // Asegúrate de inicializar auth

//Secciones y botones al ser usuario
const addEstribilloButton = document.getElementById("addEstribilloBtn");
const editEstribilloButton = document.getElementById("editEstribilloBtn");
const deleteEstribilloButton = document.getElementById("deleteEstribilloBtn");
// logout
const logoutButton = document.getElementById("logoutBtn");

// Formularios de registro e inicio de sesión
const registerForm = document.getElementById("CrearCuenta");
const loginForm = document.getElementById("IniciarSesion");

// Botones de registro e inicio de sesión
const registerButton = document.getElementById("registerBtn");
const loginButton = document.getElementById("loginBtn");

const username = document.getElementById("username");

// Desplegar el nombre del usuario en <p id="user" style="display: none;"></p>
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("users").doc(user.uid).get()
            .then(doc => {
                const userData = doc.data();
                document.getElementById("user").innerText = "Bienvenido, " + userData.username;
                const userP = document.getElementById("user");
                userP.style.display = "block";
            });
    }
    else {
        document.getElementById("user").style.display = "none";
    }
});

// Funcion de apertura de página
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        if (page.style.display === "block") {
            page.style.display = "none";
        }
    });

    showLoader();

    setTimeout(() => {
        document.querySelectorAll(".page").forEach(page => {
            page.style.display = page.id === pageId ? "block" : "none";
        });
    }, 2000);
}

auth.onAuthStateChanged(user => {
    if (user) {
        addEstribilloButton.style.display = "block";
        editEstribilloButton.style.display = "block";
        deleteEstribilloButton.style.display = "block";
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";
        document.getElementById("listaEstribillosBtn").style.display = "block";
    } else {
        addEstribilloButton.style.display = "none";
        editEstribilloButton.style.display = "none";
        deleteEstribilloButton.style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("registerBtn").style.display = "block";
        document.getElementById("listaEstribillosBtn").style.display = "none";
    }
});

// Funcion de animación de carga
function showLoader() {
    // En el primer cambio de páginas hacer display: none a la pagina actual
    document.querySelectorAll(".page").forEach(page => {
        if (page.style.display === "block") {
            page.style.display = "none";
        }
    });

    // Mostrar loader
    document.getElementById("loader").style.display = "block";

    // Ocultar loader y mostrar página
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.querySelectorAll(".page").forEach(page => {
            page.style.display = page.id === "home" ? "block" : "none";
        });
    }, 2000);
}

// Funcion para contraer el menu en dispositivos moviles
function toggleHeader() {
    const nav = document.getElementById("nav");
    nav.classList.toggle("collapsed");  // Alterna la clase para ocultar o mostrar el header
}


// Funcion de registro por usuario, correo y contraseña
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const username = document.getElementById("registerUsername").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            saveUserData(userCredential.user.uid, username, email);
            alert("Usuario registrado exitosamente");
            showPage("IniciarSesion");
        })
        .catch(error => {
            alert("Error en el registro: " + error.message);
        });
});

// Funcion de inicio de sesión por correo y contraseña
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Inicio de sesión exitoso");
            showPage("Inicio");
        })
        .catch(error => {
            alert("Error al iniciar sesión: " + error.message);
        });
});

// Guardar datos del usuario en Firestore
function saveUserData(userId, username, email) {
    db.collection("users").doc(userId).set({
        username: username,
        email: email
    })
    .then(() => {
        console.log("Datos del usuario guardados exitosamente");
    })
    .catch(error => {
        console.error("Error al guardar los datos del usuario: ", error);
    });
}

// Función de cerrar sesión
function logout() {
    auth.signOut()
        .then(() => {
            alert("Sesión cerrada exitosamente");
            showPage("IniciarSesion");
        })
        .catch(error => {
            alert("Error al cerrar sesión: " + error.message);
        });
}

// Función para buscar y mostrar un estribillo
function searchEstribillo() {
    // Obtener el valor del número y el nombre de los campos de búsqueda
    const searchByNum = document.getElementById("searchByNum").value;
    const searchByName = document.getElementById("searchByName").value;
    const estribilloDiv = document.getElementById("estribillo");

    // Limpiar el div de resultados
    estribilloDiv.innerHTML = "Buscando...";

    let query;

    // Definir la consulta en Firestore
    if (searchByNum) {
        query = db.collection("estribillos").where("numero", "==", parseInt(searchByNum));
    } else if (searchByName) {
        query = db.collection("estribillos").where("titulo", "==", searchByName);
    } else if (searchByNum && searchByName) {
        estribilloDiv.innerHTML = "Introduce solo un número o un nombre para buscar, no ambos.";
        return;
    } else {
        estribilloDiv.innerHTML = "Introduce un número o nombre para buscar.";
        return;
    }

    // Ejecutar la consulta y mostrar el resultado
    query.get()
    .then((querySnapshot) => {
        if (!querySnapshot.empty) {
            // Mostrar el primer estribillo encontrado
            const estribillo = querySnapshot.docs[0].data();

            // Modificar el contenido para agregar <p></p> despues de cada punto
            const contenidoModificado = estribillo.contenido.replace(/\./g, '.<p></p>');

            estribilloDiv.innerHTML = `
                <h4>Título: ${estribillo.titulo}</h4>
                <h5>Estribillo número: ${estribillo.numero}</h5>
                <r>Letra:</r>
                <center>${contenidoModificado}</center>
            `;
        } else {
            estribilloDiv.innerHTML = "Estribillo no encontrado.";
        }
    })
    .catch((error) => {
        console.error("Error al buscar el estribillo: ", error);
        estribilloDiv.innerHTML = "Error al buscar el estribillo.";
    });
}

// Referencia al formulario de añadir estribillo
const addEstribilloForm = document.getElementById("addEstribilloForm");

// Función para añadir un estribillo
addEstribilloForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("addEstribilloTitle").value;
    const lyrics = document.getElementById("addEstribilloLyrics").value;

    try {
        // Obtener el número de estribillo más alto existente
        const snapshot = await db.collection("estribillos").orderBy("numero", "desc").limit(1).get();
        let newNumber = 1; // Si no hay estribillos, empezar desde 1

        if (!snapshot.empty) {
            newNumber = snapshot.docs[0].data().numero + 1;
        }

        // Añadir el nuevo estribillo con título, letra y número
        await db.collection("estribillos").add({
            numero: newNumber,
            titulo: title,
            contenido: lyrics
        });

        alert("Estribillo añadido exitosamente");
        // Limpiar el formulario
        addEstribilloForm.reset();

    } catch (error) {
        console.error("Error al añadir estribillo: ", error);
        alert("Hubo un error al añadir el estribillo. Inténtalo de nuevo.");
    }
});

// Función para eliminar un estribillo
const deleteEstribilloForm = document.getElementById("deleteEstribilloForm");
deleteEstribilloForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("deleteEstribilloTitle").value;
    deleteEstribillo(searchTerm);
});

// Función para eliminar un estribillo por número o nombre
async function deleteEstribillo(searchTerm) {
    try {
        // Buscar el estribillo por número
        const snapshot = await db.collection("estribillos")
            .where("numero", "==", searchTerm)
            .get();

        if (snapshot.empty) {
            // Si no se encontró por número, intentar buscar por título
            const titleSnapshot = await db.collection("estribillos")
                .where("titulo", "==", searchTerm)
                .get();

            if (titleSnapshot.empty) {
                alert("Estribillo no encontrado");
                return;
            } else {
                titleSnapshot.forEach(async (doc) => {
                    // Eliminar el documento del estribillo
                    await doc.ref.delete();
                });
            }
        } else {
            snapshot.forEach(async (doc) => {
                // Eliminar el documento del estribillo
                await doc.ref.delete();
            });
        }
        alert("Estribillo eliminado exitosamente");

    } catch (error) {
        console.error("Error al eliminar estribillo: ", error);
        alert("Hubo un error al eliminar el estribillo. Inténtalo de nuevo.");
    }
}

// Función para editar un estribillo por título
const editEstribilloForm = document.getElementById("editEstribilloForm");
editEstribilloForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleToEdit = document.getElementById("editEstribilloTitle").value;
    const newLyrics = document.getElementById("editEstribilloLyrics").value;

    db.collection("estribillos")
        .where("titulo", "==", titleToEdit)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert("Estribillo no encontrado.");
                return;
            }

            querySnapshot.forEach((doc) => {
                doc.ref.update({ contenido: newLyrics })
                    .then(() => {
                        alert("Estribillo editado exitosamente.");
                        editEstribilloForm.reset();
                    })
                    .catch((error) => {
                        console.error("Error al editar el estribillo: ", error);
                        alert("Error al editar el estribillo.");
                    });
            });
        })
        .catch((error) => {
            console.error("Error al buscar el estribillo: ", error);
            alert("Error al buscar el estribillo.");
        });
});

//Funcion para mostrar la lista de estribillos ordenados por número en <div id="listaEstribillos"></div>
function showEstribillos() {
    const estribillosDiv = document.getElementById("listaEstribillos");

    // Limpiar el div de resultados
    estribillosDiv.innerHTML = "Cargando...";

    // Obtener los estribillos ordenados por número
    db.collection("estribillos")
        .orderBy("numero")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                estribillosDiv.innerHTML = "No hay estribillos.";
                return;
            }

            // Mostrar los estribillos en el div
            estribillosDiv.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const estribillo = doc.data();
                estribillosDiv.innerHTML += `
                    <li>${estribillo.numero} - ${estribillo.titulo}</li> 
                `;
            });
        })
        .catch((error) => {
            console.error("Error al buscar los estribillos: ", error);
            estribillosDiv.innerHTML = "Error al buscar los estribillos.";
        });
}

// Mostrar la lista de estribillos al cargar la página
showEstribillos();
