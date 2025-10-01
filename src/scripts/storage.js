const STORAGE_KEY = 'trello-board-data';

export const storage = {
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
        }
    },

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return null;
        }
    },

    getDefaultData() {
        return {
            columns: [
                {
                    id: 'todo',
                    title: 'To Do',
                    cards: [
                        { id: '1', text: 'Изучить JavaScript' },
                        { id: '2', text: 'Создать проект' }
                    ]
                },
                {
                    id: 'inProgress',
                    title: 'In Progress',
                    cards: [
                        { id: '3', text: 'Разработать интерфейс' }
                    ]
                },
                {
                    id: 'done',
                    title: 'Done',
                    cards: [
                        { id: '4', text: 'Настроить окружение' }
                    ]
                }
            ]
        };
    }
};