<script lang="ts">
	import { Chart, registerables } from "chart.js";

	import zoomPlugin from "chartjs-plugin-zoom";

	import "chartjs-adapter-luxon";
	import ChartStreaming from "chartjs-plugin-streaming";

	import { onMount } from "svelte";

	export let chartCanvas: HTMLCanvasElement;

	let chart: Chart;

	let i = 0.0;

	onMount(async () => {
		const ctx = chartCanvas.getContext("2d");

		Chart.register(...registerables);
		Chart.register(zoomPlugin);
		Chart.register(ChartStreaming);

		chart = new Chart(ctx, {
			type: "line",
			data: {
				datasets: [
					{
						label: "Channel 1",
						backgroundColor: "rgb(255, 99, 132)",
						borderColor: "rgb(255, 99, 132)",
						data: [],
					},
				],
			},
			options: {
				elements: {
                    point:{
                        radius: 0
                    }
                },
				plugins: {
					// Change options for ALL axes of THIS CHART
					streaming: {
						duration: 10000,
						frameRate: 30,
					},
					zoom: {
						// Assume x axis has the realtime scale
						pan: {
							enabled: true, // Enable panning
							mode: "x", // Allow panning in the x direction
						},
						zoom: {
							pinch: {
								enabled: true, // Enable pinch zooming
							},
							wheel: {
								enabled: true, // Enable wheel zooming
							},
							mode: "x", // Allow zooming in the x direction
						},
						limits: {
							x: {
								minDelay: 1000, // Min value of the delay option
								maxDelay: 100, // Max value of the delay option
								minDuration: 1000, // Min value of the duration option
								maxDuration: 10000, // Max value of the duration option
							}
						},
					},
				},
				scales: {
					x: {
						type: "realtime",
						// Change options only for THIS AXIS
						realtime: {
							delay: 2000,
							duration: 10000,
						}
					},
					y: {
						type: "linear",
						min: 0 -0.5,
						max: 3.3 + 0.5,
					},
				},
			},
		});

		setInterval(async () => {
			// append the new data to the existing chart data
			chart.data.datasets[0].data.push({
				x: Date.now(),
				y: i,
			});

			if (i >= 3.3) {
				i = 0;
			} else {
				i+= 0.01;
			}

			// update chart datasets keeping the current animation
			chart.update("quiet");
		}, 10);
	});
</script>

<main>
	<canvas bind:this={chartCanvas} width="16" height="6" />
</main>

<style>
</style>
