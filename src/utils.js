class UtilsClass {
  validateFeedback({ name, email, rating, description, areTermsChecked }) {
    if (!name || !email || !rating || !areTermsChecked) {
      return "Name, email, rating and terms and conditions are mandatory.";
    }
    const emailRegex = new RegExp(
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    );
    if (!emailRegex.test(email)) {
      return "Email is not correct.";
    }

    if (description && description.length < 20) {
      return "Please provide a description of at least 20 characters.";
    }
    return "";
  }
}

const Utils = new UtilsClass();
export { Utils };
