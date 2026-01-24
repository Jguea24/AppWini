export const traceabilityService = {
  async getTraceability(productId: number) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      origin: 'Amazonas, Peru',
      cooperatives: ['Coop. Rio Verde', 'Finca La Nube'],
      process: ['Fermentacion 5 dias', 'Secado al sol', 'Tostado artesanal'],
      coordinates: { lat: -3.7437, lng: -73.2516 },
    };
  },
};
