const hre = require("hardhat");

async function main() {
  const MyContract = await hre.ethers.getContractFactory("MyContract");
  const myContract = await MyContract.deploy("0xFD4973FeB2031D4409fB57afEE5dF2051b171104");

  await myContract.deployed();

  console.log("Greeter deployed to:", myContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
