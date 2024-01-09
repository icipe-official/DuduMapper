export async function OccurrenceFilterServerProps(){
    const API_URL  =  '';
    const res = await fetch(`${API_URL}/species`);
    const speciesData = await res.json();

    const resDiseases =  await fetch(`${API_URL}/diseases`)
    const diseaseData = resDiseases.json();

    const resCountries =  await fetch(`${API_URL}/countries`)
    const countriesData = resCountries.json();

    return {
        props: {
            species: speciesData,
            diseases: diseaseData,
            countries: countriesData
        }
    }

}