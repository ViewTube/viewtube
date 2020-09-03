#/bin/bash
# ViewTube installation script

# Dependency versions
NODE_VERSION=14

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

printf "\n
██╗░░░██╗██╗███████╗░██╗░░░░░░░██╗████████╗██╗░░░██╗██████╗░███████╗
██║░░░██║██║██╔════╝░██║░░██╗░░██║╚══██╔══╝██║░░░██║██╔══██╗██╔════╝
╚██╗░██╔╝██║█████╗░░░╚██╗████╗██╔╝░░░██║░░░██║░░░██║██████╦╝█████╗░░
░╚████╔╝░██║██╔══╝░░░░████╔═████║░░░░██║░░░██║░░░██║██╔══██╗██╔══╝░░
░░╚██╔╝░░██║███████╗░░╚██╔╝░╚██╔╝░░░░██║░░░╚██████╔╝██████╦╝███████╗
░░░╚═╝░░░╚═╝╚══════╝░░░╚═╝░░░╚═╝░░░░░╚═╝░░░░╚═════╝░╚═════╝░╚══════╝
\n"

printf "Checking dependencies\n"

MISSING_DEPS=()

NODE_LOCAL=$(($(nsode -v | tr -dc '0-9')/100))

if (( NODE_LOCAL >= $NODE_VERSION ));
then
  MISSING_DEPS+=("Node.js ${NODE_VERSION}.x")
fi

echo ${MISSING_DEPS}