from pymongo import MongoClient
from bson.objectid import ObjectId
import sys



URI = "mongodb+srv://vcontrerasg:12345@cluster0.qcjvc8l.mongodb.net/"
client = MongoClient(URI)
db = client['portfolio_ucsc']



def obtener_datos(coleccion_nombre):

    datos = {}
    print(f"\n--- Ingrese los datos para {coleccion_nombre.capitalize()} ---")
    
    if coleccion_nombre == "integrantes":
        datos = {
            "nombre": input("Nombre completo: "),
            "rol": input("Rol (ej. Estudiante UCSC): "),
            "sobreMi": input("Descripción 'Sobre mí': "),
            "habilidades": input("Habilidades (separadas por coma): ").split(','),
            "foto": input("URL de la foto: ")
        }

    elif coleccion_nombre == "proyectos":
        datos = {
            "titulo": input("Título del proyecto: "),
            "descripcion": input("Descripción corta: "),
            "urlGithub": input("URL GitHub: "),
            "urlDemo": input("URL Demo: "),
            "tecnologias": input("Tecnologías (separadas por coma): ").split(',')
        }

    elif coleccion_nombre == "mensajes":
        datos = {
            "nombre": input("Nombre del remitente: "),
            "correo": input("Correo electrónico: "),
            "tipoConsulta": input("Tipo de consulta (Sugerencia, Contratación, Otro): "),
            "mensaje": input("Mensaje: ")
        }

    return datos

def operacion_crud(nombre_col):
    coleccion = db[nombre_col]

    while True:
        print(f"\n>>> Gestión de: {nombre_col.upper()} <<<")
        print("1. Ver todos")
        print("2. Insertar nuevo")
        print("3. Actualizar existente")
        print("4. Eliminar")
        print("5. Volver al menú anterior")
        
        opcion = input("Selecciona una opción: ")
        
        try:
            if opcion == '1':
                docs = list(coleccion.find())
                if not docs: print("No hay documentos en esta colección.")
                for doc in docs: print(doc)
                
            elif opcion == '2':
                nuevo = obtener_datos(nombre_col)
                coleccion.insert_one(nuevo)
                print("¡Documento insertado correctamente!")
                
            elif opcion == '3':
                id_b = input("Ingresa el ID del documento a actualizar: ")
                actualizaciones = obtener_datos(nombre_col)
                res = coleccion.update_one({"_id": ObjectId(id_b)}, {"$set": actualizaciones})
                if res.matched_count > 0:
                    print("¡Actualización exitosa!")
                else:
                    print("No se encontró un documento con ese ID.")
                    
            elif opcion == '4':
                id_b = input("Ingresa el ID del documento a eliminar: ")
                res = coleccion.delete_one({"_id": ObjectId(id_b)})
                if res.deleted_count > 0:
                    print("¡Documento eliminado!")
                else:
                    print("No se encontró un documento con ese ID.")
                    
            elif opcion == '5':
                break

            else:
                print("Opción no válida.")

        except Exception as e:
            print(f"Error: {e}. Asegúrate de que el ID tenga el formato correcto.")


def menu_principal():
    print("¡Bienvenido al sistema de gestión de tu Portfolio!")
    while True:
        print("\n=== MENÚ PRINCIPAL ===")
        print("¿Qué desea editar?")
        print("1. Integrantes")
        print("2. Mensajes")
        print("3. Proyectos")
        print("4. Salir")
        
        opcion = input("Selecciona una opción (1-4): ")
        
        if opcion == '1': operacion_crud("integrantes")
        elif opcion == '2': operacion_crud("mensajes")
        elif opcion == '3': operacion_crud("proyectos")
        elif opcion == '4':
            print("Cerrando sesión...")
            sys.exit()
        else:
            print("Opción inválida, intente de nuevo.")



if __name__ == "__main__":
    menu_principal()