var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
	dotfiles: true,
	message: 'Generated gh-pages'
    },
    () => {
        console.log('Deploy Complete!')
    }
)
