import template from "../index.html";
import differenceInDays from "date-fns/differenceInDays";
import { differenceInCalendarDays } from "date-fns";
import { Utils } from "../utils";
import { Chart } from "chart.js/auto";

async function createComponent() {
  document.body.insertAdjacentHTML("beforeend", template);
}

try {
  await createComponent();
} catch (e) {
  console.log(`Something went wrong.. ${e}`);
}

class SkiSlopesApp {
  initLocalStorageRating() {
    const slopeElements = document.querySelectorAll(".slope-name");

    slopeElements.forEach((slopeElement) => {
      localStorage.setItem(slopeElement.getAttribute("name"), "0");
    });
  }

  getChildrenElementsOfCards() {
    const cardsChildren = document.querySelector(".cards").children;
    console.log(cardsChildren.length);
  }

  addFooterInfo() {
    const footerElement = document.querySelector("footer");
    const currentYear = new Date().getFullYear();
    const endOfSeason = new Date(2023, 3, 1);
    const daysLeft = differenceInCalendarDays(endOfSeason, new Date());

    const html = `<p>Ski season ${currentYear}. There are ${daysLeft} days left to ski this season.</p>`;

    footerElement.insertAdjacentHTML("beforeend", html);
  }

  showRatingsModal() {
    const ratingElement = document.querySelector(".rating");
    const pageContentElement = document.getElementById("page-content");

    ratingElement.classList.remove("hide");
    ratingElement.classList.add("show");
    pageContentElement.classList.add("low-opacity");
    pageContentElement.classList.remove("full-opacity");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const gradeInput = document.getElementById("grade");
    const termsInput = document.getElementById("terms");

    nameInput.value = "";
    emailInput.value = "";
    messageInput.value = "";
    gradeInput.value = 1;
    termsInput.checked = false;
  }

  hideRatingModal() {
    const ratingElement = document.querySelector(".rating");
    const pageContentElement = document.getElementById("page-content");

    pageContentElement.classList.add("full-opacity");
    pageContentElement.classList.remove("low-opacity");

    ratingElement.classList.add("hide");
    ratingElement.classList.remove("show");
  }

  addSlopeTitle(title) {
    const titleElement = document.getElementById("title");
    titleElement.innerText = `Your choice : ${title}`;
  }

  onSubmitFeedback(event) {
    event.preventDefault();

    const nameValue = event.target["name"].value;
    const emailValue = event.target["email"].value;
    const messageValue = event.target["message"].value;
    const gradeValue = event.target["grade"].value;
    const termsValue = event.target["terms"].value;

    const formData = {
      name: nameValue,
      email: emailValue,
      rating: gradeValue,
      description: messageValue,
      areTermsChecked: termsValue,
    };

    const validateData = Utils.validateFeedback(formData);
    const errorMessageElement = document.querySelector(".error-message");

    if (validateData === "") {
      const reviewSubmitted = new CustomEvent("submit-form", {
        detail: {
          formData,
          selectedSlope: nameValue,
        },
      });
      dispatchEvent(reviewSubmitted);
      errorMessageElement.innerText = "";
    } else {
      errorMessageElement.innerText = validateData;
    }
  }

  onClickSlope(event) {
    if (
      event.target.classList.contains("image") ||
      event.target.classList.contains("slope-name")
    ) {
      const slopeName = event.target.getAttribute("name");
      this.addSlopeTitle(slopeName);
      this.selectedSlope = slopeName;
      this.showRatingsModal();
    }
  }

  updateLocalStorageRatings(key, submittedRating) {
    const currentRating =
      parseInt(localStorage.getItem(key)) + parseInt(submittedRating);

    localStorage.setItem(key, currentRating);

    return [key, currentRating];
  }

  createChart() {
    // chart-ul este la finalul paginii
    const canvasElement = `
            <div>
                <canvas id='ratingChart' style='width:100%;max-width=700px'></canvas>
            </div>`;

    document.body.insertAdjacentHTML("beforeend", canvasElement);

    const chartElement = document.getElementById("ratingChart");

    const slopeNames = [];
    const slopeRatings = [];

    for (const [key, value] of Object.entries(localStorage)) {
      slopeNames.push(key);
      slopeRatings.push(value);
    }

    const chart = new Chart(chartElement, {
      type: "bar",
      data: {
        labels: slopeNames,
        datasets: [
          {
            label: "# of Votes",
            data: slopeRatings,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return chart;
  }

  updateChart(chart, slopeName, slopeRating) {
    const slopeIndex = chart.data.labels.indexOf(slopeName);
    chart.data.datasets[0].data[slopeIndex] = slopeRating;
    chart.update();
  }

  initializeApp() {
    const submitElement = document.getElementsByClassName("submit");
    const cardsElement = document.querySelector(".cards");
    this.selectedSlope = "";

    this.initLocalStorageRating();
    this.getChildrenElementsOfCards();
    this.addFooterInfo();
    this.hideRatingModal();
    const chart = this.createChart();

    addEventListener("submit", (event) => {
      this.onSubmitFeedback(event);
    });
    cardsElement.addEventListener("click", (event) => {
      this.onClickSlope(event);

      const xButtonElement = document.getElementById("close-form");
      xButtonElement.addEventListener("click", () => this.hideRatingModal());
    });
    addEventListener("submit-form", (event) => {
      const ratingSubmitted = event.detail.formData.rating;
      const [slopeName, slopeRating] = this.updateLocalStorageRatings(
        this.selectedSlope,
        ratingSubmitted
      );
      this.hideRatingModal();
      this.updateChart(chart, slopeName, slopeRating);
    });
  }
}

const app = new SkiSlopesApp();
app.initializeApp();
