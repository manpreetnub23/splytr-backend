export const calculateBalances = (expenses) => {
	const balances = {};

	for (const expense of expenses) {
		const paidBy = expense.paidBy.toString();

		if (!balances[paidBy]) balances[paidBy] = 0;

		balances[paidBy] += expense.amount;

		for (const split of expense.splits) {
			const userId = split.user.toString();

			if (!balances[userId]) balances[userId] = 0;

			balances[userId] -= split.amount;
		}
	}

	return balances;
};
