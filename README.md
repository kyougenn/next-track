<div align="center">
    <a href="https://github.com/kyougenn/next_track">
        <img src="https://img.ute.su/aT0tpZ.png" alt="Logo" width="640" height="240">
    </a>
    <h3 align="center">Next Track</h3>
    <p align="center">
        A Music Recommendation API
    </p>
</div>

## Getting Started

This README contains the instructions needed to get Next Track up and running. Next Track is containerized using Docker and orchestrated using Docker Compose, so you will not need to install NodeJS, MariaDB or Redis on your machine.

### Prerequisites

Before starting, make sure that you have the following applications installed, and make sure that they are running on your machine.
* Git
* Docker

### Installation

1. Open a terminal window of your choice (PowerShell, Windows CMD, or Git Bash)
2. Run the following to download the project's source code
    ```sh
   git clone https://github.com/kyougenn/next-track.git
   ```
2. Enter the project's folder by running the following command
   ```sh
   cd next-track
   ```
3. Create the environment variables by copying the template provided (no changes needed)
   ```sh
   cp .env.example .env
   ```
4. Run the following to create the custom Docker containers for the back end and the front end, start the containers, and create and populate the MariaDB database with the song dataset.
   ```sh
   docker-compose up --build -d
   ```
   Once the command finishes processing, Next Track is up and running.

## Usage

To access the front end user interface, open your web browser and navigate to: [http://localhost:3000](http://localhost:3000)

The back end web API is accessible at the following URL (optional): [http://localhost:8080](http://localhost:8080)

### Stopping Next Track

1. To stop all of the running containers, run the following command from within the project's root folder
    ```sh
    docker-compose down
    ```
    If you would like to completely reset the project, and erase all of the database data, use the "-v" flag
    ```sh
    docker-compose down -v
    ```