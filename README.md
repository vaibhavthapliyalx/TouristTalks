# Tourist Talks

![Tourist Talks Logo](/src/assets/logo.png)

## Overview

Welcome to Tourist Talks, a captivating platform designed to enrich your tourism experience. This application allows users to explore and review various businesses and attractions. The dataset, adapted from the Gov.uk website, provides valuable information about approximately 124 tourist attractions, including their location and reviews.

## Dataset Source

Adapted from [Gov.uk Website](https://www.data.gov.uk/dataset/b8051901-5978-43bd-bee4-c0a473794ee5/sites-and-attractions)

## Functionality

### Onboarding (Stretch Goal)

New users will undergo an onboarding process where they can create their account, choose a username, and optionally upload a profile photo.

### Feed Section

Explore recent reviews in a paginated interface, sorted by the most recent reviews for a seamless navigation experience.

### Search

Utilize the search bar to find tourist places based on categories, tags, or names.

### Tourist Attractions

Each attraction features a comprehensive table with information such as location, opening times, description, and more.

### User Interaction (Stretch Goal)

Authenticated users can like/dislike reviews and perform the following actions:

- **Add a Review:** Share your experience by adding a new review.
- **Edit Review:** Modify your existing reviews for accuracy.
- **Delete Review:** Remove reviews that are no longer relevant.
- **List New Attraction (Stretch Goal):** Contribute by adding details of a new tourist attraction.
- **Delete Listing (Stretch Goal):** Remove listings that are no longer valid.

## Tech Stack

- **Frontend:** Angular
- **Backend:** Python with Flask
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Testing:** Pytest
- **Linting:** Eslint

## Development Tools

- **API Testing:** Postman
- **Server Communication:** Axios

## How to Run Locally

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/tourist_talks.git
    cd tourist-talks
    ```

2. Install dependencies for both frontend and backend:

    ```bash
    npm install
    cd api && pip install -r requirements.txt
    ```

3. Run both servers concurrently:

    ```bash
    npm run dev
    ```

Visit [http://localhost:3000](http://localhost:3000) to explore the application.

## Deployment

Tourist Talks is hosted on [Your Hosting Platform]. Visit [Tourist Talks Live](https://tourist-talks.live) to experience the live application.

## Disclaimer

This project, Tourist Talks, is intended for reference purposes only. It is not to be copied, and all code belongs to the original author. No warranty is provided, and it is solely for educational and reference purposes.

Feel free to customize or enhance the README as needed.
