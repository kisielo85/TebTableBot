module.exports = async ({msg, tableData}) => {
    find_str = msg.options.get('find').value
    info = await tableData.where(find_str)

    if (info) msg.reply({content: info})
    else msg.reply({content: `sorry, nie znalazłem "${find_str}"`, ephemeral: true})
}