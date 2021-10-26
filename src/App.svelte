<script lang="ts">
	import { Chart, registerables } from "chart.js";
	import zoomPlugin from "chartjs-plugin-zoom";
	import "chartjs-adapter-luxon";
	import ChartStreaming from "chartjs-plugin-streaming";

	Chart.register(...registerables);
	Chart.register(zoomPlugin);
	Chart.register(ChartStreaming);

	import { onMount } from "svelte";

	export let canvas: HTMLCanvasElement;

	const serial_supported = "serial" in navigator;

	let chart: Chart;
	let currentData = [];

	let pallete = ["red", "blue", "green", "yellow"];

	onMount(async () => {
		let datasets = [];

		for (let i = 0; i < pallete.length; i++) {
			datasets.push({
				label: `Channel #${i + 1}`,
				borderColor: pallete[i],
				backgroundColor: pallete[i],
				pointRadius: 0,
				pointHoverRadius: 0,
				data: [],
			});
		}

		chart = new Chart(canvas, {
			type: "line",
			data: {
				datasets: datasets,
			},
			options: {
				parsing: false,
				normalized: true,
				animation: false,
				spanGaps: true,
				plugins: {
					decimation: {
						enabled: true,
						algorithm: 'min-max',
					},
					tooltip: {
						enabled: false,
					},
					zoom: {
						// Assume x axis has the realtime scale
						pan: {
							enabled: true,        // Enable panning
							mode: 'x'             // Allow panning in the x direction
						},

						zoom: {
							pinch: {
								enabled: true       // Enable pinch zooming
							},
							
							wheel: {
								enabled: true       // Enable wheel zooming
							},

							mode: 'x'             // Allow zooming in the x direction
						},

						limits: {
							x: {
								minDelay: 40,     // Min value of the delay option
								maxDelay: 200,     // Max value of the delay option
								minDuration: 1000,  // Min value of the duration option
								maxDuration: 5000,   // Max value of the duration option
							}
						}
					}
				},
				scales: {
					x: {
						type: "realtime",
						display: false,
						realtime: {
							duration: 4000,
							delay: 200,
							refresh: 50,
							frameRate: 60,
							onRefresh: (chart) => {
								for (
									let i = 0;
									i <
									Math.min(
										currentData.length,
										pallete.length
									);
									i++
								) {
									chart.data.datasets[i].data.push(
										currentData[i]
									);
								}

								currentData.length = 0;
							},
						}
					},
					y: {
						title: {
							display: true,
						},
						min: -(3.3 + 0.5),
						max: 3.3 + 0.5,
					},
				}
			},
		});

		const port = await navigator.serial.requestPort();
		await port.open({ baudRate: 115200 });

		const decoder = new TextDecoderStream();
		port.readable.pipeTo(decoder.writable);

		const reader = decoder.readable.getReader();

		let buffer = "";

		while (true) {
			const { value, done } = await reader.read();

			if (done) {
				// Allow the serial port to be closed later.
				reader.releaseLock();
				break;
			}

			buffer += value;

			let index: number;
			while ((index = buffer.indexOf("\n")) != -1) {
				let line = buffer.slice(0, index - 1);

				const header = "TRACE:";
				if (line.startsWith(header)) {
					let split = line.substring(header.length).split(";");
					currentData = split.map((element) => {
						return {
							x: Date.now(),
							y: parseFloat(element),
						};
					});
				}

				buffer = buffer.slice(index + 1);
			}
		}
	});
</script>

<main>
	{#if serial_supported}
		<canvas bind:this={canvas} />
	{:else}
		<p>The Web Serial API is not supported in this browser.</p>
	{/if}
</main>

<style>
</style>
