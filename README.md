# Capstone Project Scraper 
This website uses a scraper to gather information from user inputted websites to create a dataset of images of historical artifacts and their corresponding date.
The idea is to attempt to use the dataset in the future with artificial intelligence to try to predict artifact ages from their image.

After the scrape, the dataset can be downloaded as a `.tar.gz` using the Download button in the Display Dataset Page.

## Development: 
### Requirements
- nodejs (18.X)
- Google Chrome (for Puppeteer)

### Installation
```bash
#1. Clone the repository 
$ git clone https://github.com/Alyks1/Capstone.git && cd Capstone
#2. Install pnpm 
$ npm install -g pnpm
#3. Install dependencies
$ pnpm install
```

Start the application with `$ pnpm start`. The loglevel can be set like so: `$ pnpm start -l [loglevel]` where the loglevels are: 
_Network_, _Trace_, _Debug_, _Info_ and _Warn_.

## Usage [Unstable]
To run the docker image, run: \
`$ docker run -p 5001:3000 ghcr.io/alyks1/capstone:latest`

## Licence: 
GNU General Public License v3.0