async function main() {

  const MedicineSupplyChain = await ethers.getContractFactory("MedicineSupplyChain");

  const contract = await MedicineSupplyChain.deploy();

  await contract.deployed();

  console.log("MedicineSupplyChain deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
