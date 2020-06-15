from flask import Flask,render_template, request, session, Response, redirect
from database import connector
from model import entities
import json
import time
import datetime

db = connector.Manager()
engine = db.createEngine()

app = Flask(__name__)


@app.route('/static/<content>')
def static_content(content):
    return render_template(content)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/authenticate', methods=['POST'])
def authenticate():
    msg = json.loads(request.data)
    db_session = db.getSession(engine)
    user = db_session.query(entities.User).filter(entities.User.username == msg['username'], entities.User.password == msg['password']).first()
    #print(user.username)
    if user:
        r_msg = {'msg':'Welcome'}
        json_msg = json.dumps(r_msg)
        session['logged_user']=user.id
        return Response(json_msg, status=200, mimetype='application/json');
    r_msg = {'msg':'Failed'}
    json_msg = json.dumps(r_msg)
    return Response(json_msg, status=401, mimetype='application/json')


@app.route('/deauthenticate', methods=['POST'])
def deauthenticate():
    r_msg = {'msg':'Bye Bye'}
    json_msg = json.dumps(r_msg)
    session['logged_user']=''
    return Response(json_msg, status=200, mimetype='application/json');



#####CRUD users####
# CREATE
@app.route('/users', methods = ['POST'])
def create_user():
    #create user object
    #c = json.loads(request.data)
    c = json.loads(request.form['values'])
    user = entities.User(
        username=c['username'],
        name=c['name'],
        fullname=c['fullname'],
        password=c['password']
    )
    #send user to persistence layer
    session = db.getSession(engine)
    session.add(user)
    session.commit()
    #Response client
    r_msg = {'msg':'UserCreated'}
    json_msg = json.dumps(r_msg)
    return Response(json_msg, status=201)

# READ
@app.route('/users/<id>', methods = ['GET'])
def get_user(id):
    db_session = db.getSession(engine)
    users = db_session.query(entities.User).filter(entities.User.id == id)
    for user in users:
        js = json.dumps(user, cls=connector.AlchemyEncoder)
        return  Response(js, status=200, mimetype='application/json')
    message = { 'status': 404, 'message': 'Not Found'}
    return Response(json.dumps(message), status=404, mimetype='application/json')

@app.route('/users', methods = ['GET'])
def get_users():
    #consultar todos los usuarios
    session = db.getSession(engine)
    dbResponse = session.query(entities.User)
    #convertir los usuarios a JSON
    data = dbResponse[:]
    #Responder al cliente
    return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')

# UPDATE
@app.route('/users', methods = ['PUT'])
def update_user():
    # buscar usuario por id
    session = db.getSession(engine)
    id = request.form['key']
    user = session.query(entities.User).filter(entities.User.id == id).first()
    # actualizar los datos del usuario
    c = json.loads(request.form['values'])
    for key in c.keys():
        setattr(user, key, c[key])

    session.add(user)
    session.commit()
    return 'Updated User'

# DELETE
@app.route('/users', methods = ['DELETE'])
def delete_user():
    id = request.form['key']
    session = db.getSession(engine)
    user = session.query(entities.User).filter(entities.User.id == id).one()
    session.delete(user)
    session.commit()
    # Response
    return "Deleted User"

# CURRENT USER
@app.route('/current', methods = ['GET'])
def current_user():
    print(session)
    db_session = db.getSession(engine)
    user = db_session.query(entities.User).filter(entities.User.id == session['logged_user']).first()
    # Devuelve el usuario loggea
    return Response(json.dumps(user, cls = connector.AlchemyEncoder), mimetype = 'application/json')

#CRUD messages
@app.route('/messages', methods = ['POST'])
def create_message():
    c = json.loads(request.form['values'])
#    format = '%d/%m/%Y' # The format
#    datetime_str = datetime.datetime.strptime(c['sent_on'], format)
#    print(datetime_str)
    message = entities.Message(
        content=c['content'],
        # sent_on=datetime_str,
        user_from_id=c['user_from_id']['username']['username'],
        user_to_id=c['user_to_id']['username']['username']
    )
    session = db.getSession(engine)
    session.add(message)
    session.commit()
    r_msg = {'msg':'Message Created!'}
    json_msg = json.dumps(r_msg)
    return Response(json_msg, status=201)

@app.route('/messages_json', methods = ['POST'])
def create_messages_data():
#    msg = json.loads(request.data[])
    c = json.loads(request.data)
#    format = '%d/%m/%Y' # The format
#    datetime_str = datetime.datetime.strptime(c['sent_on'], format)
#    print(datetime_str)
    message = entities.Message(
        content=c['content'],
#        sent_on=datetime_str,
        user_from_id=c['user_from_id'],
        user_to_id=c['user_to_id']
    )
    session = db.getSession(engine)
    session.add(message)
    session.commit()
    r_msg = {'msg':'Message Created!'}
    json_msg = json.dumps(r_msg)
    return Response(json_msg, status=201)


@app.route('/messages/<id>', methods = ['GET'])
def get_message(id):
    db_session = db.getSession(engine)
    messages = db_session.query(entities.Message).filter(entities.Message.id == id)
    for user in messages:
        js = json.dumps(user, cls=connector.AlchemyEncoder)
        return  Response(js, status=200, mimetype='application/json')
    message = { 'status': 404, 'message': 'Not Found'}
    return Response(json.dumps(message), status=404, mimetype='application/json')

@app.route('/messages', methods = ['GET'])
def get_messages():
    session = db.getSession(engine)
    dbResponse = session.query(entities.Message)
    data = dbResponse[:]
    return Response(json.dumps(data, cls=connector.AlchemyEncoder), mimetype='application/json')

@app.route('/messages', methods = ['PUT'])
def update_message():
    session = db.getSession(engine)
    id = request.form['key']
    message =session.query(entities.Message).filter(entities.Message.id == id).first()
    c = json.loads(request.form['values'])

    for key in c.keys():
        setattr(message, key, c[key])

    return 'Updated Message!'

@app.route('/messages', methods = ['DELETE'])
def delete_message():
    id = request.form['key']
    session = db.getSession(engine)
    message = session.query(entities.Message).filter(entities.Message.id == id).one()
    session.delete(message)
    session.commit()
    return "Deleted Message!"

if __name__ == '__main__':
    app.secret_key = ".."
    app.run(port=8080, threaded=True, host=('127.0.0.1'))
