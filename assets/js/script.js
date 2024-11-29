const API_URL = "https://mindicador.cl/api";
let chart; // Variable global para almacenar el gráfico

document.addEventListener("DOMContentLoaded", async () => {
    const currencySelect = document.getElementById("currency");

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al obtener los datos de la API.");
        const data = await response.json();

        const currencies = ["dolar", "euro", "uf", "utm"];
        currencies.forEach(currency => {
            if (data[currency]) {
                const option = document.createElement("option");
                option.value = currency;
                option.textContent = `${currency.charAt(0).toUpperCase()}${currency.slice(1)}`;
                currencySelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error al cargar las monedas:", error.message);
        document.getElementById("result").textContent = `Error al cargar las monedas: ${error.message}`;
    }
});

document.getElementById("convertButton").addEventListener("click", async () => {
    const amount = document.getElementById("amount").value;
    const currency = document.getElementById("currency").value;
    const resultElement = document.getElementById("result");

    if (!amount || amount <= 0) {
        resultElement.textContent = "Por favor, ingrese un monto válido.";
        return;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al obtener los datos de la API.");
        const data = await response.json();

        const rate = data[currency]?.valor;
        if (!rate) throw new Error("Moneda no válida o no disponible.");

        const result = (amount / rate).toFixed(2);
        resultElement.textContent = `Resultado: $${result}`;

        // Llama a la función para mostrar el gráfico
        await displayChart(currency);

    } catch (error) {
        console.error("Error durante la conversión:", error.message);
        resultElement.textContent = `Error: ${error.message}`;
    }
});

// Función para mostrar el gráfico con el historial de 10 días
async function displayChart(currency) {
    try {
        const response = await fetch(`${API_URL}/${currency}`);
        if (!response.ok) throw new Error("Error al obtener los datos históricos de la API.");
        const data = await response.json();

         // Validar que hay suficientes datos históricos
         if (!data.serie || data.serie.length < 10) {
            throw new Error("No hay suficiente información histórica disponible.");
        }

        // Extrae los últimos 10 días
        const last10Days = data.serie.slice(0, 10).reverse();

        const labels = last10Days.map(item => item.fecha.split("T")[0]); // Fechas
        const values = last10Days.map(item => item.valor); // Valores de la moneda

        // Muestra el contenedor del gráfico antes de intentar crear el gráfico
        const chartContainer = document.getElementById("chartContainer");
        chartContainer.style.display = "block";

        // Si ya hay un gráfico, destrúyelo antes de crear uno nuevo
        if (chart) chart.destroy();

        const ctx = document.getElementById("myChart").getContext("2d");
        chart = new Chart(ctx, {
            type: "line", // Tipo de gráfico
            data: {
                labels: labels,
                datasets: [{
                    label: `Historial últimos 10 días (${currency})`,
                    data: values,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.4 // Suavidad de la línea
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error al cargar el gráfico:", error.message);
        document.getElementById("result").textContent = `Error al cargar el gráfico: ${error.message}`;
    }
}