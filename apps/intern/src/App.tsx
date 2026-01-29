import kalkulatorLogo from './assets/kalkulator.svg'

import './App.css'

function App() {
	return (
		<>
			<div>
				<a href="https://nav.no/pensjon/kalkulator/login" target="_blank">
					<img src={kalkulatorLogo} className="logo" alt="Kalkulator logo" />
				</a>
			</div>
			<h1>Intern kalkulator</h1>
			<p className="read-the-docs">
				Click on the Kalkulator logo to learn more
			</p>
		</>
	)
}

export default App
