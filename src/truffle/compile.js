import { dir, readFile, writeFile } from './files';
import { CONTRACTS_PATH, BUILD_CONTRACTS_PATH } from './paths';

const solc = require('solc/wrapper');
const compiler = solc(window.Module);

async function compile() {
  let contracts = await dir(CONTRACTS_PATH);
  contracts = contracts.map(c => `/contracts/${c}`);
  for (const contract of contracts) {
    const content = await readFile(contract);
    const compiled = compiler.compile(content, 1);
    for (const key of Object.keys(compiled.contracts)) {
      const name = key.substr(1);
      const compiledContract = compiled.contracts[key];
      const json = {
        contract_name: name,
        abi: JSON.parse(compiledContract.interface),
        binary: compiledContract.bytecode,
      }
      await writeFile({
        path: `${BUILD_CONTRACTS_PATH}${name}.json`,
        content: JSON.stringify(json),
      })
    }
  }
}

export default compile;
